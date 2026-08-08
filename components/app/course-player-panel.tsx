'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Play, Clock } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { CourseDoc } from '@/lib/firebase/courses'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEnrollment } from '@/lib/hooks/useEnrollment'

interface CoursePlayerPanelProps {
  course: CourseDoc
  initialLessonId?: string
  autoplay: boolean
}

interface Lesson {
  id: string
  title: string
  duration?: string | number
  videoUrl: string
}

interface LessonListItemProps {
  lesson: Lesson
  index: number
  isActive: boolean
  onSelect: (lessonId: string) => void
}

/**
 * Extracted + memoized so selecting a lesson only re-renders the
 * item whose active state actually changed, not the entire list.
 */
const LessonListItem = memo(function LessonListItem({
  lesson,
  index,
  isActive,
  onSelect,
}: LessonListItemProps) {
  const handleClick = useCallback(() => onSelect(lesson.id), [onSelect, lesson.id])

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`Play lesson ${index + 1}: ${lesson.title}`}
        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
          isActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:bg-slate-50 dark:hover:bg-slate-900'
        }`}
      >
        <Play className="size-4 flex-shrink-0 text-primary" aria-hidden="true" />

        <span className="flex-1 font-medium">
          {index + 1}. {lesson.title}
        </span>

        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" />
          {lesson.duration}
        </span>
      </button>
    </li>
  )
})

function CoursePlayerPanelComponent({
  course,
  initialLessonId,
  autoplay,
}: CoursePlayerPanelProps) {
  const { user } = useAuth()
  const { isEnrolled } = useEnrollment(user?.uid, course.id)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Prevent undefined errors
  const lessons = useMemo(() => course.lessons ?? [], [course.lessons])

  const [activeLessonId, setActiveLessonId] = useState(initialLessonId ?? lessons[0]?.id)

  const activeLesson = useMemo(() => {
    if (lessons.length === 0) return undefined

    return lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0]
  }, [lessons, activeLessonId])

  // Stable reference so LessonListItem's memoization is effective and the
  // handler isn't recreated on every render.
  const selectLesson = useCallback(
    (lessonId: string) => {
      setActiveLessonId(lessonId)

      const params = new URLSearchParams(searchParams.toString())
      params.set('lesson', lessonId)
      params.set('autoplay', '1')

      router.replace(`?${params.toString()}`, {
        scroll: false,
      })
    },
    [router, searchParams],
  )

  if (!isEnrolled) return null

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
            // Metadata-only preload avoids fetching the full video until the user
            // interacts, improving initial page load / bandwidth usage without
            // affecting playback behavior once triggered.
            preload="metadata"
            aria-label={`Video player: ${activeLesson.title}`}
          >
            <track kind="captions" />
          </video>

          <h2 className="font-heading text-xl font-bold mb-4">Course Curriculum</h2>

          <ul className="space-y-2" aria-label="Lesson list">
            {lessons.map((lesson, idx) => (
              <LessonListItem
                key={lesson.id}
                lesson={lesson}
                index={idx}
                isActive={lesson.id === activeLesson.id}
                onSelect={selectLesson}
              />
            ))}
          </ul>
        </>
      ) : (
        <div className="py-10 text-center">
          <h2 className="mb-2 text-xl font-bold">Course Curriculum</h2>
          <p className="text-muted-foreground">No lessons available for this course.</p>
        </div>
      )}
    </Card>
  )
}

CoursePlayerPanelComponent.displayName = 'CoursePlayerPanel'
export const CoursePlayerPanel = memo(CoursePlayerPanelComponent)