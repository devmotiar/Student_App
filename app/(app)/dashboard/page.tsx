'use client';

import Link from 'next/link';
import { ArrowRight, Radio, TrendingUp, Loader2, Sparkles } from 'lucide-react';

import { useFirebaseData } from '@/lib/hooks/useFirebaseData';
import { currentUser, dashboardStats } from '@/lib/mock-data';
import { PageHeader } from '@/components/app/page-header';
import { CourseCard } from '@/components/app/course-card';
import { ProgressBar } from '@/components/app/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ContinueLearning from '@/components/ui/continue-learning'
import { UpcomingLiveClasses } from '@/components/ui/upcominglive';
import RecommendedCourses from '@/components/ui/RecommendedCourses'
import { where } from 'firebase/firestore';

import { useAuth } from '@/lib/hooks/useAuth'

export default function DashboardPage() {
  const { data: courses, loading: coursesLoading } = useFirebaseData('courses')
  const { data: liveClasses, loading: classesLoading } = useFirebaseData('liveClasses')
  const {userProfile}=useAuth()

  const inProgress = courses.filter((c: any) => c.progress > 0 && c.progress < 100)
  const recommended = courses.filter((c: any) => c.progress === 0).slice(0, 3)
  const upcoming = liveClasses.filter((c: any) => c.status !== 'ended').slice(0, 3)

  const isLoading = coursesLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
        <PageHeader
          title={`Welcome back, ${userProfile?.displayName}`}
          description="Here's a snapshot of your learning journey today."
        />
        {/* Loading skeletons */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border/60 bg-muted/40"
            />
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }
  console.log("demo")

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Good to see you again
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {userProfile?.displayName} 👋
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Here's a snapshot of your learning journey today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              {stat.hint}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
      

       <div className="lg:col-span-2">
          <ContinueLearning/>
        </div>

        {/* Upcoming live classes */}

        <div>
          <UpcomingLiveClasses />
        </div>
      </div>

      
     <div className="mb-10 mt-8">
        <RecommendedCourses/>
      </div>
    </div>
  );
}
