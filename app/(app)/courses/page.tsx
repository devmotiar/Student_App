'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { PageHeader } from '@/components/app/page-header'
import { CourseCard } from '@/components/app/course-card'
import { cn } from '@/lib/utils'

const filters = ['All', 'In progress', 'Completed', 'Not started'] as const

export default function CoursesPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const { data: courses, loading } = useFirebaseData('courses')

  const filtered = courses.filter((c: any) => {
    if (filter === 'In progress') return c.progress > 0 && c.progress < 100
    if (filter === 'Completed') return c.progress >= 100
    if (filter === 'Not started') return c.progress === 0
    return true
  })

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="My Courses"
        description="All the courses you've enrolled in, in one place."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f
          const count =
            f === 'All'
              ? courses.length
              : courses.filter((c) => {
                  if (f === 'In progress') return c.progress > 0 && c.progress < 100
                  if (f === 'Completed') return c.progress >= 100
                  return c.progress === 0
                }).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  active ? 'bg-primary-foreground/20' : 'bg-muted',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No courses in this category yet.
          </p>
        </div>
      )}
    </div>
  )
}
