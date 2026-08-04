'use client'

import Link from 'next/link'
import { Loader2, CheckCircle2, Play } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEnrollment } from '@/lib/hooks/useEnrollment'
import type { CourseDoc } from '@/lib/firebase/courses'

export function CourseEnrollSidebar({ course }: { course: CourseDoc }) {
  const { user } = useAuth()
  const { isEnrolled, checking, enrolling, error, enroll } = useEnrollment(user?.uid, course.id)

  if (checking) {
    return (
      <Card className="p-6 sticky top-20 flex justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </Card>
    )
  }

  return (
    <Card className="p-6 sticky top-20">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {isEnrolled ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 flex gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
                Enrolled
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                You can now access all course content
              </p>
            </div>
          </div>

          {course.lessons?.[0] && (
            <Link href={`/courses/${course.id}?lesson=${course.lessons[0].id}&autoplay=1`}>
              <Button className="w-full">
                <Play className="size-4 mr-2" />
                Continue Learning
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-lg font-bold text-foreground mb-2">Enroll now</p>
            <p className="text-sm text-muted-foreground mb-4">
              Get access to all {course.lessons?.length ?? 0} lessons and materials
            </p>
          </div>
          <Button onClick={enroll} disabled={enrolling} className="w-full" size="lg">
            {enrolling && <Loader2 className="size-4 mr-2 animate-spin" />}
            {enrolling ? 'Enrolling...' : 'Enroll in Course'}
          </Button>
        </div>
      )}
    </Card>
  )
}