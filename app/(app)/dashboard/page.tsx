'use client'

import Link from 'next/link'
import { ArrowRight, Radio, TrendingUp, Loader2 } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { currentUser, dashboardStats } from '@/lib/mock-data'
import { PageHeader } from '@/components/app/page-header'
import { CourseCard } from '@/components/app/course-card'
import { ProgressBar } from '@/components/app/progress-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { where } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'

export default function DashboardPage() {
  const { data: courses, loading: coursesLoading } = useFirebaseData('courses')
  const { data: liveClasses, loading: classesLoading } = useFirebaseData('liveClasses')
  const {userProfile}=useAuth()

  const inProgress = courses.filter((c: any) => c.progress > 0 && c.progress < 100)
  const recommended = courses.filter((c: any) => c.progress === 0).slice(0, 3)
  const upcoming = liveClasses.filter((c: any) => c.status !== 'ended').slice(0, 3)

  const isLoading = coursesLoading || classesLoading


  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={`Welcome back, ${userProfile?.displayName}`}
          description="Here's a snapshot of your learning journey today."
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  console.log("demo")

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Welcome back, ${userProfile?.displayName}`}
        description="Here's a snapshot of your learning journey today."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              {stat.hint}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Continue learning
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {inProgress.map((course) => (
              <Card key={course.id} className="flex items-center gap-4 p-3">
                <div
                  className="hidden size-16 shrink-0 rounded-lg bg-cover bg-center sm:block"
                  style={{ backgroundImage: `url(${course.image})` }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {course.title}
                  </p>
                  <p className="text-xs text-muted-foreground">by {course.instructor}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar value={course.progress} className="max-w-[180px]" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <Button className="hidden h-9 shrink-0 text-xs sm:inline-flex">
                  Resume
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming live classes */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Upcoming live
            </h2>
            <Link
              href="/live-classes"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              All <ArrowRight className="size-4" />
            </Link>
          </div>
          <Card className="divide-y divide-border">
            {upcoming.map((cls) => (
              <div key={cls.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  {cls.status === 'live' ? (
                    <Badge variant="live">
                      <Radio className="size-3" /> Live now
                    </Badge>
                  ) : (
                    <Badge variant="muted">
                      {cls.date}, {cls.time}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{cls.duration}</span>
                </div>
                <p className="text-sm font-semibold text-foreground text-pretty">
                  {cls.title}
                </p>
                <p className="text-xs text-muted-foreground">{cls.instructor}</p>
                <Button
                  variant={cls.status === 'live' ? 'default' : 'outline'}
                  className="mt-1 h-8 w-full text-xs"
                >
                  {cls.status === 'live' ? 'Join now' : 'Set reminder'}
                </Button>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Recommended for you
          </h2>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  )
}
