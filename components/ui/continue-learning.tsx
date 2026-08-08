'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  CheckCircle2,
  BookOpen,
  Clock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

import { useAuth } from '@/lib/hooks/useAuth'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { useCourseProgress } from '@/lib/hooks/useLearningData'
import type { CourseRecord, EnrolledCourseViewModel } from '@/lib/learning-types'
import { getCourseProgressStatus } from '@/lib/firebase-progress-operations'
import { Button } from '@/components/ui/button'

const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'

interface CoursePillProps {
  course: EnrolledCourseViewModel
  index: number
  isSelected: boolean
  onSelect: (index: number) => void
}

/**
 * Extracted + memoized so switching the active course only re-renders the
 * pill whose selected state changed, not the entire selector row.
 */
function CoursePill({ course, index, isSelected, onSelect }: CoursePillProps) {
  const handleClick = useCallback(() => onSelect(index), [onSelect, index])

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Switch to ${course.title || (course as any).Course}, ${course.progress}% complete`}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        isSelected
          ? 'border-primary bg-primary/10 text-primary font-semibold'
          : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <span className="truncate max-w-[150px]">{course.title || (course as any).Course}</span>
      <span
        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
          course.status === 'Completed'
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
            : 'bg-primary/20 text-primary'
        }`}
      >
        {course.progress}%
      </span>
    </button>
  )
}

export default function ContinueLearning() {
  const { user, userProfile } = useAuth()
  const { data: courses, loading: coursesLoading } = useFirebaseData<CourseRecord>('courses')
  const { data: progressList, loading: loadingProgress } = useCourseProgress(user?.uid)
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0)

  // Combine enrolled courses and courses with progress
  const enrolledAndActiveCourses = useMemo(() => {
    if (!courses || courses.length === 0) return []

    const userEnrolledIds = userProfile?.enrolledCourses || []

    const mapped = courses
      .map((course: any) => {
        const prog = progressList.find((p) => p.courseId === course.id)
        const isEnrolled = userEnrolledIds.includes(course.id)
        const hasProgress = prog && (prog.progress > 0 || prog.lastWatchedLessonIndex !== undefined)

        if (!isEnrolled && !hasProgress) return null

        const rawProgress = prog ? Number(prog.progress) : 0
        const progress = Math.min(100, Math.max(0, rawProgress))
        const status = getCourseProgressStatus(progress)
        const isCompleted = status === 'Completed'

        // Determine current lesson title
        const videoList = Array.isArray(course.allCourse) ? course.allCourse : []
        const maxLessonIndex = Math.max(0, videoList.length - 1)
        const savedLessonIndex = prog?.lastWatchedLessonIndex ?? 0
        const lastIdx = Math.min(Math.max(0, savedLessonIndex), maxLessonIndex)
        const currentLessonTitle =
          prog?.lastLessonTitle ||
          (videoList[lastIdx]?.Title ? `Lesson ${lastIdx + 1}: ${videoList[lastIdx].Title}` : null) ||
          (videoList.length > 0 ? `Lesson 1: ${videoList[0].Title}` : 'Course Overview')

        return {
          ...course,
          progress,
          status,
          isCompleted,
          lastWatchedLessonIndex: lastIdx,
          currentLessonTitle,
          lastAccessedAt: prog?.lastAccessedAt,
          thumbnail: course.image || course.thumbnail || FALLBACK_THUMBNAIL,
        }
      })
      .filter(Boolean) as EnrolledCourseViewModel[]

    // Sort by most recently accessed, then highest progress
    mapped.sort((a, b) => {
      const timeA = a.lastAccessedAt?.toMillis ? a.lastAccessedAt.toMillis() : 0
      const timeB = b.lastAccessedAt?.toMillis ? b.lastAccessedAt.toMillis() : 0
      if (timeA !== timeB) return timeB - timeA
      return b.progress - a.progress
    })

    return mapped
  }, [courses, progressList, userProfile?.enrolledCourses])

  const isLoading = coursesLoading || loadingProgress

  const handleSelectCourse = useCallback((index: number) => {
    setSelectedCourseIndex(index)
  }, [])

  if (isLoading) {
    return (
      <div
        className="w-full rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Loading continue learning…</span>
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 rounded-lg bg-muted/60 animate-pulse" aria-hidden="true" />
          <div className="h-4 w-16 rounded-lg bg-muted/40 animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row animate-pulse" aria-hidden="true">
          <div className="h-44 w-full rounded-2xl bg-muted/60 lg:h-40 lg:w-72" />
          <div className="flex flex-1 flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-3/4 rounded-lg bg-muted/60" />
              <div className="h-4 w-1/2 rounded-lg bg-muted/40" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-muted/40" />
              <div className="h-10 w-32 rounded-xl bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no enrolled or active courses, offer to start first available course
  if (enrolledAndActiveCourses.length === 0) {
    const featuredCourse = courses && courses.length > 0 ? courses[0] : null

    return (
      <div className="w-full rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Continue Learning</h2>
            <p className="text-xs text-muted-foreground">Pick up right where you left off</p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold text-primary transition hover:underline"
          >
            Explore Courses
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-base font-bold text-foreground">Start Your Learning Journey</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            You haven&apos;t enrolled in any courses yet. Explore our top courses and start watching
            lessons today!
          </p>

          {featuredCourse ? (
            <Link
              href={`/courses/${featuredCourse.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <Play className="size-3.5 fill-current" aria-hidden="true" />
              Start {(featuredCourse as any).title || (featuredCourse as any).Course || 'Featured Course'}
            </Link>
          ) : (
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              Browse All Courses
            </Link>
          )}
        </div>
      </div>
    )
  }

  const activeCourse = enrolledAndActiveCourses[selectedCourseIndex] || enrolledAndActiveCourses[0]
  const resumeHref = `/courses/${activeCourse.id}?lesson=${activeCourse.lastWatchedLessonIndex}`
  const isActiveCompleted = activeCourse.status === 'Completed'

  return (
    <div className="w-full rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Continue Learning</h2>
            <p className="text-xs text-muted-foreground">
              {enrolledAndActiveCourses.length}{' '}
              {enrolledAndActiveCourses.length === 1 ? 'course in progress' : 'courses in progress'}
            </p>
          </div>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
        >
          View all
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Main Active Course Card */}
      <div className="flex flex-col gap-6 rounded-2xl lg:flex-row">
        {/* Thumbnail with Dynamic Status Badge */}
        <div className="relative h-48 w-full overflow-hidden rounded-2xl lg:h-44 lg:w-72 shrink-0 bg-muted">
          <Image
            src={activeCourse.thumbnail || '/placeholder.svg'}
            alt={activeCourse.title || 'Course thumbnail'}
            fill
            // This card is typically rendered above the fold on the dashboard,
            // so prioritize it for a better LCP instead of lazy-loading.
            priority
            className="object-cover transition duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 300px"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent" aria-hidden="true" />

          {/* Status Badge: "In Progress" if < 100%, "Completed" if reaches 100% */}
          <div className="absolute right-3 top-3">
            {isActiveCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur">
                <Clock className="size-3.5" aria-hidden="true" />
                In Progress
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {activeCourse.instructor || activeCourse.category || 'Active Course'}
              </span>
            </div>

            <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {activeCourse.title || (activeCourse as any).Course}
            </h3>

            <p className="mt-1.5 line-clamp-1 text-xs sm:text-sm font-medium text-muted-foreground">
              {activeCourse.currentLessonTitle}
            </p>

            {/* Progress Section */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Course Progress</span>
                <span className="font-bold text-foreground">{activeCourse.progress}%</span>
              </div>

              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={activeCourse.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${activeCourse.title || (activeCourse as any).Course} progress`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActiveCompleted ? 'bg-emerald-500' : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.max(5, activeCourse.progress)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action & Resume Button */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-muted-foreground">
              {isActiveCompleted
                ? 'Great job! You finished this course.'
                : `Resuming Lesson ${(activeCourse.lastWatchedLessonIndex || 0) + 1}`}
            </span>

            <Link
              href={resumeHref}
              aria-label={
                isActiveCompleted
                  ? `Review ${activeCourse.title || (activeCourse as any).Course}`
                  : `Continue learning ${activeCourse.title || (activeCourse as any).Course}`
              }
            >
              <Button
                className={`rounded-xl px-5 py-2.5 text-xs font-semibold shadow transition-all ${
                  isActiveCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isActiveCompleted ? (
                  <>
                    <RotateCcw className="size-3.5 mr-1.5" aria-hidden="true" />
                    Review Course
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 mr-1.5 fill-current" aria-hidden="true" />
                    Continue Learning
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Multiple enrolled courses selector pills */}
      {enrolledAndActiveCourses.length > 1 && (
        <div className="mt-6 border-t border-border/50 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Other Enrolled Courses
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Switch enrolled course">
            {enrolledAndActiveCourses.map((course, idx) => (
              <CoursePill
                key={course.id}
                course={course}
                index={idx}
                isSelected={selectedCourseIndex === idx}
                onSelect={handleSelectCourse}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}