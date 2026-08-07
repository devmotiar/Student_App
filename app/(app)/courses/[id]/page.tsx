"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ListVideo,
  PlayCircle,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Award,
} from "lucide-react";
import { useFirebaseData } from "@/lib/hooks/useFirebaseData";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getCourseProgress,
  trackVideoWatch,
  updateCourseProgress,
} from "@/lib/firebase-progress-operations";
import { enrollInCourse } from "@/lib/firebase-auth-operations";
import type { CourseRecord } from "@/lib/learning-types";
import { YouTubeLessonPlayer } from "@/components/youtube-lesson-player";

interface Video {
  Title: string;
  Description?: string;
  Note?: string;
  Link?: string;
}

function getYoutubeId(url: string) {
  if (!url) return "";

  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

  const match = url.match(regExp);

  return match && match[1].length === 11 ? match[1] : "";
}

export default function CourseVideoPlayer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const initialLessonParam = searchParams.get("lesson");

  const { user } = useAuth();
  const { data: courses, loading } = useFirebaseData<CourseRecord>("courses");

  const course = useMemo(() => {
    if (!courses) return null;
    return courses.find((item) => item.id === courseId);
  }, [courses, courseId]);

  const videoList = useMemo<Video[]>(() => {
    return (Array.isArray(course?.allCourse) ? course.allCourse : []) as Video[];
  }, [course]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const lastSavedProgressRef = useRef(0);
  const userId = user?.uid;

  // Initialize and load saved progress from Firebase or URL
  useEffect(() => {
    if (!courseId) return;

    // Check if lesson param in URL is specified
    if (initialLessonParam !== null) {
        const idx = parseInt(initialLessonParam, 10);
        if (!isNaN(idx) && idx >= 0) {
          setSelectedIndex(Math.min(idx, Math.max(0, videoList.length - 1)));
      }
    }

    // Fetch user saved progress from Firebase
    if (user?.uid) {
      getCourseProgress(user.uid, courseId)
        .then((prog) => {
          if (prog) {
            setUserProgress(prog.progress || 0);
            lastSavedProgressRef.current = prog.progress || 0;
            setIsCompleted(prog.status === "completed" || prog.progress >= 100);
            if (
              initialLessonParam === null &&
              prog.lastWatchedLessonIndex !== undefined &&
              prog.lastWatchedLessonIndex >= 0
            ) {
              setSelectedIndex(
                Math.min(prog.lastWatchedLessonIndex, Math.max(0, videoList.length - 1))
              );
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load course progress:", err);
        });

      // Auto enroll if not already
      enrollInCourse(user.uid, courseId).catch(() => {});
    }
  }, [courseId, user?.uid, initialLessonParam, videoList.length]);

  // Handle lesson selection and save progress
  const handleSelectLesson = async (index: number) => {
    setSelectedIndex(index);

    if (videoList.length > 0 && user?.uid) {
      const calculatedProgress = Math.round(((index + 1) / videoList.length) * 100);
      const isDone = calculatedProgress >= 100;
      setUserProgress(calculatedProgress);
      setIsCompleted(isDone);
      lastSavedProgressRef.current = Math.max(
        lastSavedProgressRef.current,
        calculatedProgress
      );

      try {
        await updateCourseProgress(user.uid, courseId, calculatedProgress, {
          lastWatchedLessonIndex: index,
          lastLessonTitle: videoList[index]?.Title || `Lesson ${index + 1}`,
          status: isDone ? "completed" : "in-progress",
        });
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    }
  };

  const handleVideoProgress = useCallback(
    async (currentTime: number, duration: number) => {
      if (!userId || !duration || currentTime < 0) return;

      try {
        await trackVideoWatch(
          userId,
          `${courseId}-lesson-${selectedIndex}`,
          currentTime,
          duration,
          { courseId, lessonIndex: selectedIndex }
        );

        // A lesson counts toward course progress after it is actually watched,
        // not merely when it is selected from the lesson list.
        if (currentTime < duration * 0.9 || !videoList.length) return;

        const calculatedProgress = Math.round(
          ((selectedIndex + 1) / videoList.length) * 100
        );
        if (calculatedProgress <= lastSavedProgressRef.current) return;

        lastSavedProgressRef.current = calculatedProgress;
        setUserProgress(calculatedProgress);
        setIsCompleted(calculatedProgress >= 100);
        await updateCourseProgress(userId, courseId, calculatedProgress, {
          lastWatchedLessonIndex: selectedIndex,
          lastLessonTitle: videoList[selectedIndex]?.Title || `Lesson ${selectedIndex + 1}`,
          status: calculatedProgress >= 100 ? "completed" : "in-progress",
        });
      } catch (error) {
        console.error("Failed to save YouTube playback progress:", error);
      }
    },
    [courseId, selectedIndex, userId, videoList]
  );

  const handleVideoCompleted = useCallback(
    (currentTime: number, duration: number) => {
      void handleVideoProgress(currentTime || duration, duration);
    },
    [handleVideoProgress]
  );

  if (loading) {
    return (
      <Card className="p-16 text-center rounded-3xl border-border">
        <div className="flex flex-col items-center justify-center">
          <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Loading course player...</p>
        </div>
      </Card>
    );
  }

  if (!course) {
    return (
      <Card className="p-10 text-center rounded-3xl border-border">
        <h2 className="text-xl font-bold">Course not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested course is not available.
        </p>
        <Link href="/courses" className="mt-6 inline-block">
          <Button className="rounded-full">Back to Courses</Button>
        </Link>
      </Card>
    );
  }

  if (!videoList.length) {
    return (
      <Card className="p-10 text-center rounded-3xl border-border">
        <ListVideo className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">No videos available</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This course doesn&apos;t have any video lessons yet.
        </p>
        <Link href="/courses" className="mt-6 inline-block">
          <Button className="rounded-full">Back to Courses</Button>
        </Link>
      </Card>
    );
  }

  const currentVideo = videoList[selectedIndex] || videoList[0];
  const progressPercent =
    userProgress > 0
      ? userProgress
      : Math.round(((selectedIndex + 1) / videoList.length) * 100);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="rounded-full text-xs">
            <ArrowLeft className="size-4 mr-1.5" /> Back to My Courses
          </Button>
        </Link>

        {/* Course Progress Indicator */}
        <div className="flex items-center gap-3">
          <Badge
            variant={progressPercent >= 100 ? "default" : "secondary"}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              progressPercent >= 100
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {progressPercent >= 100 ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Completed (100%)
              </span>
            ) : (
              <span>In Progress ({progressPercent}%)</span>
            )}
          </Badge>

          <span className="text-xs text-muted-foreground font-medium">
            Lesson {selectedIndex + 1} of {videoList.length}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm">
            <YouTubeLessonPlayer
              key={selectedIndex}
              videoId={getYoutubeId(currentVideo.Link || "")}
              title={currentVideo.Title}
              onProgress={handleVideoProgress}
              onCompleted={handleVideoCompleted}
            />

            <div className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-4">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Lesson {selectedIndex + 1} of {videoList.length}
                  </span>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold text-foreground">
                    {currentVideo.Title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedIndex === 0}
                    onClick={() => handleSelectLesson(selectedIndex - 1)}
                    className="rounded-full text-xs"
                  >
                    Previous
                  </Button>

                  <Button
                    size="sm"
                    disabled={selectedIndex >= videoList.length - 1}
                    onClick={() => handleSelectLesson(selectedIndex + 1)}
                    className="rounded-full text-xs"
                  >
                    Next Lesson
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lesson Notes & Overview
                </h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {currentVideo.Description ||
                    "Watch the lesson carefully and complete any accompanying practical exercises."}
                </p>
              </div>

              {currentVideo.Note && (
                <a
                  href={currentVideo.Note}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-6"
                >
                  <Card className="group cursor-pointer rounded-2xl border bg-muted/30 transition-all duration-300 hover:border-primary hover:bg-muted/50 hover:shadow-md">
                    <div className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                        <Download className="h-6 w-6 text-primary group-hover:text-white" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base font-semibold group-hover:text-primary">
                          Download Resources & Lesson Files
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          Access notes, supplementary PDFs, source code & practice assets
                        </p>

                        <p className="mt-1.5 text-xs font-medium text-primary">
                          Click to open resource link →
                        </p>
                      </div>
                    </div>
                  </Card>
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Course Content / Lesson List */}
        <div>
          <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListVideo className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Course Content</h3>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {videoList.length} Lessons
              </span>
            </div>

            {/* Course Progress Bar */}
            <div className="mb-4 space-y-1.5 rounded-2xl bg-muted/40 p-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-foreground">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {videoList.map((video, index) => {
                const isSelected = selectedIndex === index;
                const isWatched = index <= selectedIndex;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectLesson(index)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/60 bg-card hover:bg-muted/40 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <PlayCircle className="h-5 w-5 fill-current" />
                        ) : isWatched ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-wider ${
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          Lesson {index + 1}
                        </p>

                        <h4 className="font-bold text-sm truncate">{video.Title}</h4>

                        {video.Description && (
                          <p
                            className={`mt-1 line-clamp-1 text-xs ${
                              isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {video.Description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
