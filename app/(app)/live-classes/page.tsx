'use client'

import Link from 'next/link'
import { CalendarClock, Clock, Radio, Users, Loader2 } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LiveClassesPage() {
  const { data: liveClasses, loading } = useFirebaseData('liveClasses')

  const live = liveClasses.filter((c: any) => c.status === 'live')
  const upcoming = liveClasses.filter((c: any) => c.status === 'upcoming')
  const ended = liveClasses.filter((c: any) => c.status === 'ended')

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Live Classes"
          description="Join interactive sessions with instructors in real time."
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Live Classes"
        description="Join interactive sessions with instructors in real time."
      />

      {/* Live now */}
      {live.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Live now
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {live.map((cls) => (
              <Link key={cls.id} href={`/live-classes/${cls.id}`}>
                <Card className="flex flex-col gap-4 border-primary/30 bg-accent/30 p-5 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow cursor-pointer">
                  <div className="min-w-0">
                    <Badge variant="live" className="mb-2">
                      <Radio className="size-3" /> Live
                    </Badge>
                    <h3 className="text-base font-semibold text-foreground text-pretty">
                      {cls.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cls.course} • {cls.instructor}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" /> {cls.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" /> {cls.attendees} attending
                      </span>
                    </div>
                  </div>
                  <Button className="h-11 shrink-0 px-6 text-sm">Join class</Button>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
          Upcoming
        </h2>
        <Card className="divide-y divide-border">
          {upcoming.map((cls) => (
            <Link key={cls.id} href={`/live-classes/${cls.id}`} className="contents">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <CalendarClock className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground text-pretty">
                      {cls.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cls.course} • {cls.instructor}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {cls.date}, {cls.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> {cls.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="h-9 shrink-0 text-xs">
                  View class
                </Button>
              </div>
            </Link>
          ))}
        </Card>
      </section>

      {/* Past */}
      {ended.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            Past classes
          </h2>
          <Card className="divide-y divide-border">
            {ended.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground text-pretty">
                    {cls.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cls.course} • {cls.date}
                  </p>
                </div>
                <Button variant="secondary" className="h-9 shrink-0 text-xs">
                  Watch recording
                </Button>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  )
}
