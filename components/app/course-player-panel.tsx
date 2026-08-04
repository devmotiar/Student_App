'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Play, Clock } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { CourseDoc } from '@/lib/firebase/courses'
import { useAuth } from '@/lib/hooks/useAuth'
import {useEnrollment} from '@/lib/hooks/useEnrollment'

interface CoursePlayerPanelProps {
  course: CourseDoc
  initialLessonId?: string
  autoplay: boolean
}

export function CoursePlayerPanel({
  course,
  initialLessonId,
  autoplay,
}: CoursePlayerPanelProps) {
  const { user } = useAuth()
  const { isEnrolled } = useEnrollment(user?.uid, course.id)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Prevent undefined errors
  const lessons = course.lessons ?? []

  const [activeLessonId, setActiveLessonId] = useState(
    initialLessonId ?? lessons[0]?.id
  )

  const activeLesson = useMemo(() => {
    if (lessons.length === 0) return undefined

    return (
      lessons.find((lesson) => lesson.id === activeLessonId) ??
      lessons[0]
    )
  }, [lessons, activeLessonId])

  if (!isEnrolled) return null

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId)

    const params = new URLSearchParams(searchParams.toString())
    params.set('lesson', lessonId)
    params.set('autoplay', '1')

    router.replace(`?${params.toString()}`, {
      scroll: false,
    })
  }

  return (
    <Card className="p-6">
      {activeLesson ? (
        <>
          <video
            key={activeLesson.id}
            className="w-full aspect-video rounded-lg bg-black mb-4"
            src={activeLesson.videoUrl}
            controls
            autoPlay={autoplay}
            playsInline
          />

          <h2 className="font-heading text-xl font-bold mb-4">
            Course Curriculum
          </h2>

          <div className="space-y-2">
            {lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => selectLesson(lesson.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  lesson.id === activeLesson.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <Play className="size-4 flex-shrink-0 text-primary" />

                <span className="flex-1 font-medium">
                  {idx + 1}. {lesson.title}
                </span>

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {lesson.duration}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <h2 className="mb-2 text-xl font-bold">Course Curriculum</h2>
          <p className="text-muted-foreground">
            No lessons available for this course.
          </p>
        </div>
      )}
    </Card>
  )
}