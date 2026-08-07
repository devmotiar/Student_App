'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  Clock,
  Radio,
  Users,
  Loader2,
  Search,
  Video,
  PlayCircle,
  ExternalLink,
  Sparkles,
  Calendar,
  ChevronRight,
} from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const filterTabs = ['All', 'Live Now', 'Upcoming', 'Past Recordings'] as const

export default function LiveClassesPage() {
  const { data: liveClasses, loading } = useFirebaseData('liveClasses')
  const [activeTab, setActiveTab] = useState<(typeof filterTabs)[number]>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const live = useMemo(
    () => liveClasses.filter((c: any) => c.status === 'live'),
    [liveClasses]
  )
  const upcoming = useMemo(
    () => liveClasses.filter((c: any) => c.status === 'upcoming'),
    [liveClasses]
  )
  const ended = useMemo(
    () => liveClasses.filter((c: any) => c.status === 'ended'),
    [liveClasses]
  )

  const filteredClasses = useMemo(() => {
    return liveClasses.filter((cls: any) => {
      // Tab filter
      if (activeTab === 'Live Now' && cls.status !== 'live') return false
      if (activeTab === 'Upcoming' && cls.status !== 'upcoming') return false
      if (activeTab === 'Past Recordings' && cls.status !== 'ended') return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = (cls.title || '').toLowerCase().includes(query)
        const matchCourse = (cls.course || '').toLowerCase().includes(query)
        const matchInstructor = (cls.instructor || '').toLowerCase().includes(query)
        return matchTitle || matchCourse || matchInstructor
      }

      return true
    })
  }, [liveClasses, activeTab, searchQuery])

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <PageHeader
          title="Live Interactive Classes"
          description="Learn in real time with instructors, ask questions, and collaborate with peers."
        />
        {live.length > 0 && (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 animate-pulse">
            <span className="size-2 rounded-full bg-red-500" />
            {live.length} {live.length === 1 ? 'Class is' : 'Classes are'} Live Now
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab
            let count = liveClasses.length
            if (tab === 'Live Now') count = live.length
            if (tab === 'Upcoming') count = upcoming.length
            if (tab === 'Past Recordings') count = ended.length

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {tab === 'Live Now' && (
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      isActive ? 'bg-red-300 animate-ping' : 'bg-red-500'
                    )}
                  />
                )}
                {tab}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search classes, instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-border/60 bg-card pl-9 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Loading live sessions from Firebase...
          </p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/50 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Radio className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No live classes match your criteria
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? `No sessions found matching "${searchQuery}". Try a different keyword.`
              : 'There are no live classes scheduled in this category at the moment.'}
          </p>
          {(searchQuery || activeTab !== 'All') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setActiveTab('All')
              }}
              className="mt-4 rounded-full text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Now Featured Section (if any live classes exist and matching search) */}
          {(activeTab === 'All' || activeTab === 'Live Now') && live.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-destructive" />
                </span>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Streaming Live Right Now
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {live
                  .filter((cls: any) => filteredClasses.some((fc: any) => fc.id === cls.id))
                  .map((cls: any) => (
                    <Card
                      key={cls.id}
                      className="group relative overflow-hidden rounded-3xl border-2 border-red-500/40 bg-gradient-to-br from-card via-card to-red-500/5 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-red-500/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20">
                          <Radio className="size-3.5 animate-pulse" />
                          LIVE STREAM
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Users className="size-3.5 text-primary" />
                          <span className="text-foreground">{cls.attendees || 0}</span> students in room
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {cls.course}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {cls.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Instructor: <span className="font-medium text-foreground">{cls.instructor}</span>
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span>{cls.duration || '60 min session'}</span>
                        </div>

                        <Link href={`/live-classes/${cls.id}`}>
                          <Button className="rounded-full bg-red-600 px-5 text-xs font-semibold text-white shadow hover:bg-red-700">
                            Join Class Room <ChevronRight className="size-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
          )}

          {/* Upcoming Classes Section */}
          {(activeTab === 'All' || activeTab === 'Upcoming') && upcoming.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Scheduled Upcoming Classes
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming
                  .filter((cls: any) => filteredClasses.some((fc: any) => fc.id === cls.id))
                  .map((cls: any) => (
                    <Card
                      key={cls.id}
                      className="group flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                            {cls.course}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {cls.duration || '60 min'}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                          {cls.title}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          by <span className="font-medium text-foreground/90">{cls.instructor}</span>
                        </p>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <CalendarClock className="size-4 text-primary shrink-0" />
                          <span>
                            {cls.date || 'Upcoming'}, {cls.time || 'TBA'}
                          </span>
                        </div>

                        <Link href={`/live-classes/${cls.id}`} className="block">
                          <Button variant="outline" className="w-full rounded-full text-xs font-medium group-hover:border-primary/50 group-hover:bg-primary/5">
                            View Class Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
          )}

          {/* Past Recordings Section */}
          {(activeTab === 'All' || activeTab === 'Past Recordings') && ended.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Video className="size-4 text-muted-foreground" />
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Past Class Recordings
                </h2>
              </div>

              <div className="divide-y divide-border/60 rounded-3xl border border-border/60 bg-card overflow-hidden">
                {ended
                  .filter((cls: any) => filteredClasses.some((fc: any) => fc.id === cls.id))
                  .map((cls: any) => (
                    <div
                      key={cls.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{cls.title}</h3>
                          <Badge variant="secondary" className="text-[10px]">
                            Completed
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {cls.course} • Instructor: {cls.instructor} • Streamed on {cls.date || 'Past session'}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {cls.recordingUrl ? (
                          <a
                            href={cls.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="rounded-full text-xs gap-1.5">
                              <PlayCircle className="size-3.5" /> Watch Recording
                            </Button>
                          </a>
                        ) : (
                          <Link href={`/live-classes/${cls.id}`}>
                            <Button variant="outline" size="sm" className="rounded-full text-xs">
                              View Summary
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
