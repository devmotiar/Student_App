'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, Play } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEnrollment } from '@/lib/hooks/useEnrollment'
import type { CourseDoc } from '@/lib/firebase/courses'

interface CourseEnrollSidebarProps {
  course: CourseDoc
}

function CourseEnrollSidebarComponent({ course }: CourseEnrollSidebarProps) {
  const { user } = useAuth()
  const { isEnrolled, checking, enrolling, error, enroll } = useEnrollment(user?.uid, course.id)

  // Memoized so this only recalculates when the course's lesson list actually changes,
  // not on every enroll/checking state update.
  const lessonCount = useMemo(() => course.lessons?.length ?? 0, [course.lessons])
  const firstLesson = useMemo(() => course.lessons?.[0], [course.lessons])
  const continueHref = firstLesson
    ? `/courses/${course.id}?lesson=${firstLesson.id}&autoplay=1`
    : undefined

  if (checking) {
    return (
      <Card
        className="p-6 sticky top-20 flex justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Checking enrollment status…</span>
      </Card>
    )
  }

  return (
    <Card className="p-6 sticky top-20" aria-label="Course enrollment">
      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      {isEnrolled ? (
        <div className="space-y-4">
          <div
            className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 flex gap-2"
            role="status"
          >
            <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                Enrolled
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                You can now access all course content
              </p>
            </div>
          </div>

          {continueHref && (
            <Link href={continueHref} aria-label={`Continue learning ${course.title ?? 'this course'}`}>
              <Button className="w-full">
                <Play className="size-4 mr-2" aria-hidden="true" />
                Continue Learning
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Enroll now</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Get access to all {lessonCount} lessons and materials
            </p>
          </div>
          <Button
            onClick={enroll}
            disabled={enrolling}
            className="w-full"
            size="lg"
            aria-busy={enrolling}
          >
            {enrolling && <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />}
            {enrolling ? 'Enrolling...' : 'Enroll in Course'}
          </Button>
        </div>
      )}
    </Card>
  )
}

CourseEnrollSidebarComponent.displayName = 'CourseEnrollSidebar'
export const CourseEnrollSidebar = memo(CourseEnrollSidebarComponent)