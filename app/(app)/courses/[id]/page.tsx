"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Download, ListVideo, PlayCircle } from "lucide-react";
import { useFirebaseData } from "@/lib/hooks/useFirebaseData";

interface Video {
  Title: string;
  Description: string;
  Note: string;
  Link: string;
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
  const courseId = params.id as string;

  const { data: courses, loading } = useFirebaseData("courses");

  const course = useMemo(() => {
    if (!courses) return null;
    return courses.find((item: any) => item.id === courseId);
  }, [courses, courseId]);

  const videoList = useMemo<Video[]>(() => {
    return Array.isArray(course?.allCourse) ? course.allCourse : [];
  }, [course]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset only when course changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [course?.id]);

  if (loading) {
    return (
      <Card className="p-10 text-center">
        Loading course...
      </Card>
    );
  }

  if (!course) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-xl font-bold">Course not found</h2>

        <pre className="mt-4 rounded bg-muted p-4 text-left text-xs overflow-auto">
          {JSON.stringify(courses, null, 2)}
        </pre>
      </Card>
    );
  }

  if (!videoList.length) {
    return (
      <Card className="p-10 text-center">
        <ListVideo className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">No videos available</h2>

        <pre className="mt-4 rounded bg-muted p-4 text-left text-xs overflow-auto">
          {JSON.stringify(course, null, 2)}
        </pre>
      </Card>
    );
  }

  const currentVideo = videoList[selectedIndex];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <iframe
            key={selectedIndex}
            className="aspect-video w-full"
            src={`https://www.youtube.com/embed/${getYoutubeId(
              currentVideo.Link
            )}`}
            title={currentVideo.Title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          <div className="space-y-5 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                {currentVideo.Title}
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                {currentVideo.Description}
              </p>
            </div>

            {currentVideo.Note && (
              <a
                href={currentVideo.Note}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-6"
              >
                <Card className="group cursor-pointer rounded-2xl border bg-muted/40 transition-all duration-300 hover:border-primary hover:bg-muted hover:shadow-lg">
                  <div className="flex items-center gap-4 p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary">
                      <Download className="h-7 w-7 text-primary group-hover:text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold group-hover:text-primary">
                        Download Resources
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Notes, PDFs, source code & practice files
                      </p>

                      <p className="mt-2 text-sm font-medium text-primary">
                        Click here to download →
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            )}
          </div>
        </Card>
      </div>

      {/* Course Content */}
      <div>
        <Card className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <ListVideo className="h-5 w-5" />
            <h2 className="text-xl font-bold">Course Content</h2>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto">
            {videoList.map((video, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedIndex === index
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex gap-3">
                  <PlayCircle className="mt-1 h-5 w-5 shrink-0" />

                  <div className="flex-1">
                    <p className="text-sm opacity-70">
                      Lesson {index + 1}
                    </p>

                    <h3 className="font-semibold">
                      {video.Title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm opacity-70">
                      {video.Description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}