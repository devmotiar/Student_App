'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Lock, Play, Loader2, Download } from 'lucide-react'

import { useAuth } from '@/lib/hooks/useAuth'
import { trackVideoWatch, markVideoCompleted, updateCourseProgress } from '@/lib/firebase-progress-operations'
import { VideoPlayer } from '@/components/video-player'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl: string
  description?: string
  transcript?: string
  materials?: Array<{ name: string; url: string }>
}

export default function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  // Mock lesson data
  useEffect(() => {
    const lessons: Record<string, Lesson> = {
      '1': {
        id: '1',
        title: 'Course Introduction',
        duration: '8:45',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        description: "Welcome to the course! In this introduction, we'll cover the course outline, learning objectives, and how to get the most out of this experience.",
        transcript: 'Welcome to our comprehensive course. Over the next weeks, you will learn...',
        materials: [
          { name: 'Course Overview PDF', url: '#' },
          { name: 'Introduction Slides', url: '#' },
        ],
      },
      '2': {
        id: '2',
        title: 'Getting Started',
        duration: '12:30',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        description: 'Learn how to set up your environment and get ready for the main lessons.',
        materials: [
          { name: 'Setup Guide', url: '#' },
        ],
      },
      '3': {
        id: '3',
        title: 'Fundamentals',
        duration: '18:15',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        description: 'Dive into the core concepts and fundamentals of the subject matter.',
        materials: [],
      },
      '4': {
        id: '4',
        title: 'Advanced Techniques',
        duration: '22:45',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        description: 'Master advanced techniques and best practices used by professionals.',
        materials: [],
      },
      '5': {
        id: '5',
        title: 'Real-world Projects',
        duration: '35:20',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        description: 'Apply what you\'ve learned to real-world projects and scenarios.',
        materials: [
          { name: 'Project Brief', url: '#' },
          { name: 'Project Resources', url: '#' },
        ],
      },
    }

    setLesson(lessons[params.lessonId] || lessons['1'])
  }, [params.lessonId])

  const handleVideoProgress = async (currentTime: number, duration: number) => {
    const watchProgress = (currentTime / duration) * 100
    setProgress(watchProgress)

    // Track progress every 5 seconds
    if (Math.floor(currentTime) % 5 === 0) {
      if (user) {
        try {
          await trackVideoWatch(user.uid, params.lessonId, currentTime, duration, {
            courseId: params.id,
            lessonIndex: Math.max(0, Number(params.lessonId) - 1),
          })
        } catch (err) {
          console.error('[v0] Failed to track video progress:', err)
        }
      }
    }
  }

  const handleVideoCompleted = async () => {
    if (!user || !lesson) return

    setLoading(true)
    try {
      // Mark video as completed
      await markVideoCompleted(user.uid, params.lessonId)
      setIsCompleted(true)

      // Update course progress
      const lessonIndex = Math.max(0, Number(params.lessonId) - 1)
      const newProgress = Math.min(100, Math.round(((lessonIndex + 1) / 5) * 100))
      await updateCourseProgress(user.uid, params.id, newProgress, {
        lastWatchedLessonIndex: lessonIndex,
        lastLessonTitle: lesson.title,
      })

      console.log('[v0] Video completed and progress updated')
    } catch (err) {
      console.error('[v0] Failed to mark video as completed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Back button */}
      <Link href={`/courses/${params.id}`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main video */}
        <div className="md:col-span-2">
          {/* Video player */}
          <div className="mb-6">
            <VideoPlayer
              videoUrl={lesson.videoUrl}
              title={lesson.title}
              onProgress={handleVideoProgress}
              onCompleted={handleVideoCompleted}
              autoPlay={false}
            />
          </div>

          {/* Lesson info */}
          <div className="mb-6">
            {isCompleted && (
              <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 flex gap-3 mb-4">
                <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-300">Lesson Completed!</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Great job! Your progress has been saved.
                  </p>
                </div>
              </div>
            )}

            <h1 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground mb-4">Duration: {lesson.duration}</p>

            {lesson.description && (
              <Card className="p-6 mb-6">
                <h2 className="font-semibold text-foreground mb-3">About this lesson</h2>
                <p className="text-foreground">{lesson.description}</p>
              </Card>
            )}
          </div>

          {/* Materials */}
          {lesson.materials && lesson.materials.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Download className="size-5" />
                Lesson Materials
              </h2>
              <div className="space-y-2">
                {lesson.materials.map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url}
                    download
                    className="block p-3 rounded border border-border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-sm font-medium text-primary hover:underline"
                  >
                    📄 {material.name}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Transcript */}
          {lesson.transcript && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3">Transcript</h2>
              <p className="text-foreground text-sm leading-relaxed">{lesson.transcript}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Progress card */}
          <Card className="p-6 sticky top-20 mb-6">
            <h3 className="font-semibold mb-3">Your Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Video watched</span>
                  <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {isCompleted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 flex gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                    Completed
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Keep watching to complete this lesson
                </p>
              )}
            </div>
          </Card>

          {/* Next lesson */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Next Lesson</h3>
            <Link href={`/courses/${params.id}/lesson/2`}>
              <Button variant="outline" className="w-full justify-start">
                <Play className="size-4 mr-2" />
                Getting Started
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
