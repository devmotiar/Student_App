'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Award,
  Radio,
  TrendingUp,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { useFirebaseData } from '@/lib/hooks/useFirebaseData';
import { useAuth } from '@/lib/hooks/useAuth';
import { calculateLearningStats, formatLearningHours } from '@/lib/firebase-progress-operations';
import { useCourseProgress, useVideoWatchHistory } from '@/lib/hooks/useLearningData';
import type { CourseRecord } from '@/lib/learning-types';
import { Card } from '@/components/ui/card';
import ContinueLearning from '@/components/ui/continue-learning';
import { UpcomingLiveClasses } from '@/components/ui/upcominglive';
import RecommendedCourses from '@/components/ui/RecommendedCourses';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { data: courses, loading: coursesLoading } = useFirebaseData<CourseRecord>('courses');
  const { data: liveClasses, loading: classesLoading } = useFirebaseData('liveClasses');
  const { data: progressList } = useCourseProgress(user?.uid);
  const { data: watchHistory } = useVideoWatchHistory(user?.uid);

  const stats = useMemo(
    () => calculateLearningStats(
      progressList,
      watchHistory,
      courses,
      userProfile?.enrolledCourses || []
    ),
    [progressList, watchHistory, courses, userProfile?.enrolledCourses]
  );

  const upcomingCount = useMemo(() => {
    if (!liveClasses) return 0;
    return liveClasses.filter((c: any) => c.status !== 'ended' && c.status !== 'past').length;
  }, [liveClasses]);

  // Render the dashboard shell as soon as its primary catalog data arrives.
  // Progress/watch listeners can hydrate the statistics independently instead
  // of blocking the entire page when a user subcollection is slow or empty.
  const isLoading = coursesLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
        <div className="h-36 animate-pulse rounded-3xl border border-border/60 bg-muted/30" />
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

  const dynamicStatCards = [
    {
      label: 'Enrolled Courses',
      value: `${stats.totalCourses}`,
      hint: stats.inProgressCourses > 0 ? `${stats.inProgressCourses} in progress` : 'Active courses',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Hours Learned',
      value: `${formatLearningHours(stats.totalLearnedHours)}h`,
      hint: stats.totalLearnedHours > 0 ? 'From lesson progress' : 'Start a lesson',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Completed Courses',
      value: `${stats.completedCourses}`,
      hint: stats.completedCourses > 0 ? '100% finished' : 'Keep learning',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: 'Live Sessions',
      value: `${upcomingCount}`,
      hint: upcomingCount > 0 ? `${upcomingCount} available` : 'Schedule ready',
      icon: Radio,
      color: 'text-rose-500 bg-rose-500/10',
    },
  ];

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
            Welcome back, {userProfile?.displayName || user?.displayName || 'Student'} 👋
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Here&apos;s a live snapshot of your learning journey today.
          </p>
        </div>
      </div>

      {/* Dynamic Firebase Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dynamicStatCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-border/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`flex size-8 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="size-3 text-emerald-500" />
                {stat.hint}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Continue Learning & Upcoming Live */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <div className="lg:col-span-2">
          <ContinueLearning />
        </div>

        {/* Upcoming live classes */}
        <div>
          <UpcomingLiveClasses />
        </div>
      </div>

      {/* Recommended Courses Carousel */}
      <div className="mb-10 mt-8">
        <RecommendedCourses />
      </div>
    </div>
  );
}
