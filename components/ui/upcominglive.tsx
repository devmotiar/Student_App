'use client'

import { memo, useMemo } from 'react'

import Link from 'next/link'
import { Calendar, Radio, Clock, ArrowRight, Video } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

/* =========================================================
   Types
========================================================= */

type ClassStatus = 'live' | 'upcoming' | string

interface LiveClassRecord {
  id: string
  title?: string
  instructor?: string
  course?: string
  date?: string
  time?: string
  duration?: string
  status?: ClassStatus
}

interface ColorVariant {
  bg: string
  icon: string
}

/* =========================================================
   Constants
========================================================= */

const COLOR_VARIANTS: readonly ColorVariant[] = [
  {
    bg: 'from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  {
    bg: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  {
    bg: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
] as const

const MAX_VISIBLE_CLASSES = 3

/* =========================================================
   Helpers
========================================================= */

/**
 * Filters to live/upcoming classes, surfaces live sessions first,
 * and caps the list. Extracted as a pure function so it can be
 * memoized predictably and tested independently of React.
 */
function getActiveClasses(
  liveClasses: LiveClassRecord[] | undefined,
): LiveClassRecord[] {
  if (!liveClasses || liveClasses.length === 0) {
    return []
  }

  return [...liveClasses]
    .filter((c) => c.status === 'live' || c.status === 'upcoming')
    .sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1
      if (b.status === 'live' && a.status !== 'live') return 1
      return 0
    })
    .slice(0, MAX_VISIBLE_CLASSES)
}

/* =========================================================
   Loading Skeleton
========================================================= */

function LiveClassesSkeleton() {
  return (
    <div className="space-y-4 py-2" aria-hidden="true">
      {Array.from({ length: MAX_VISIBLE_CLASSES }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-muted/60" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-muted/60" />
              <div className="h-2.5 w-20 rounded bg-muted/40" />
            </div>
          </div>
          <div className="h-6 w-14 rounded-full bg-muted/60" />
        </div>
      ))}
    </div>
  )
}

/* =========================================================
   Empty State
========================================================= */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Video className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-2.5 text-sm font-semibold text-foreground">
        No Live Classes Right Now
      </p>
      <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
        Check back soon or explore past recorded sessions.
      </p>
      <Link
        href="/live-classes"
        className="mt-3 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
      >
        Explore Schedule
      </Link>
    </div>
  )
}

/* =========================================================
   Live Class Row
========================================================= */

interface LiveClassRowProps {
  item: LiveClassRecord
  color: ColorVariant
}

const LiveClassRow = memo(function LiveClassRow({
  item,
  color,
}: LiveClassRowProps) {
  const isLive = item.status === 'live'

  return (
    <Link
      href={`/live-classes/${item.id}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-muted/20 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/50"
    >
      {/* Left info */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
            isLive
              ? 'from-red-500/20 to-orange-500/20 text-destructive dark:text-red-400'
              : `${color.bg} ${color.icon}`
          }`}
          aria-hidden="true"
        >
          {isLive ? (
            <Radio className="size-5 animate-pulse" />
          ) : (
            <Calendar className="size-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h3>

          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{item.instructor || item.course}</span>
            <span aria-hidden="true">•</span>
            <span className="font-medium text-foreground/80">
              {item.date
                ? `${item.date}${item.time ? `, ${item.time}` : ''}`
                : item.time || 'Upcoming'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Badge */}
      <div className="shrink-0">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Clock className="size-3" aria-hidden="true" />
            {item.duration || 'Scheduled'}
          </span>
        )}
      </div>
    </Link>
  )
})

/* =========================================================
   Upcoming Live Classes
========================================================= */

export function UpcomingLiveClasses() {
  const { data: liveClasses, loading } =
    useFirebaseData<LiveClassRecord>('liveClasses')

  const activeClasses = useMemo(
    () => getActiveClasses(liveClasses),
    [liveClasses],
  )

  return (
    <div
      className="w-full rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md"
      aria-labelledby="upcoming-live-classes-heading"
      aria-busy={loading}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Radio className="size-4 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="upcoming-live-classes-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Live Classes
            </h2>
            <p className="text-xs text-muted-foreground">
              Interactive live sessions
            </p>
          </div>
        </div>

        <Link
          href="/live-classes"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
        >
          View all
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <LiveClassesSkeleton />
      ) : activeClasses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3.5">
          {activeClasses.map((item, index) => (
            <LiveClassRow
              key={item.id}
              item={item}
              color={COLOR_VARIANTS[index % COLOR_VARIANTS.length]}
            />
          ))}
        </div>
      )}
    </div>
  )
}