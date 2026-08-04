'use client'

import Link from 'next/link'
import { ArrowLeft, Loader2, Clock, Users, ExternalLink } from 'lucide-react'

import { useFirebaseDocument } from '@/lib/hooks/useFirebaseData'
import { useAuth } from '@/lib/hooks/useAuth'
import { incrementLiveClassAttendees } from '@/lib/firebase-operations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LiveClass {
  id: string
  title: string
  course: string
  instructor: string
  date: string
  time: string
  duration: string
  status: 'live' | 'upcoming' | 'ended'
  attendees: number
  description?: string
  meetingLink?: string
  recordingUrl?: string
  requirements?: string[]
}

export default function LiveClassDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { data: liveClass, loading } = useFirebaseDocument<LiveClass>('liveClasses', params.id)

  const handleJoin = async () => {
    if (!liveClass?.meetingLink) return
    try {
      await incrementLiveClassAttendees(liveClass.id)
    } catch (err) {
      console.error('Failed to update attendee count:', err)
    }
    window.open(liveClass.meetingLink, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!liveClass) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Live class not found</p>
        <Link href="/live-classes">
          <Button variant="outline">Back to Live Classes</Button>
        </Link>
      </div>
    )
  }

  const description =
    liveClass.description ||
    `Join this live class to learn directly from ${liveClass.instructor}. This interactive session covers important topics in ${liveClass.course}.`
  const requirements = liveClass.requirements || [
    'Stable internet connection',
    'Microphone (optional)',
    'Webcam (optional)',
    'Headphones recommended',
  ]

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back button */}
      <Link href="/live-classes">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Live Classes
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Hero / join card */}
          <Card className="mb-6 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-center">
            {liveClass.status === 'live' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-3 py-1 text-xs font-semibold text-red-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-400" />
                </span>
                LIVE NOW
              </span>
            )}
            <h2 className="text-xl font-semibold text-white text-balance">{liveClass.title}</h2>
            <p className="text-sm text-slate-300">Instructor: {liveClass.instructor}</p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
              <Users className="size-4" /> {liveClass.attendees} attending
            </p>

            {liveClass.status === 'live' && liveClass.meetingLink && user && (
              <Button onClick={handleJoin} size="lg" className="mt-2">
                Join Live Class <ExternalLink className="size-4 ml-2" />
              </Button>
            )}
            {liveClass.status === 'upcoming' && (
              <p className="text-sm font-medium text-yellow-300">
                Starts {liveClass.date} at {liveClass.time}
              </p>
            )}
            {liveClass.status === 'ended' && liveClass.recordingUrl && (
              <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="mt-2">
                  Watch Recording
                </Button>
              </a>
            )}
            {liveClass.status === 'live' && !liveClass.meetingLink && (
              <p className="text-xs text-slate-400">
                The meeting link hasn&apos;t been added yet. Please check back shortly.
              </p>
            )}
            {!user && (
              <Link href="/login">
                <Button className="mt-2">Sign in to Join</Button>
              </Link>
            )}
          </Card>

          {/* Class info */}
          <Card className="p-6 mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">{liveClass.title}</h1>
            <p className="text-muted-foreground mb-4">by {liveClass.instructor}</p>

            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    liveClass.status === 'live'
                      ? 'bg-red-500 animate-pulse'
                      : liveClass.status === 'upcoming'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                  }`}
                />
                <span className="font-medium capitalize">{liveClass.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{liveClass.attendees} attending</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{liveClass.duration}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-foreground mb-2">About this class</h2>
              <p className="text-foreground">{description}</p>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">What you&apos;ll need</h2>
            <ul className="space-y-2">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex gap-2 text-foreground">
                  <span className="text-primary">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Class Details</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Course</p>
                <p className="text-foreground font-medium">{liveClass.course}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Instructor
                </p>
                <p className="text-foreground font-medium">{liveClass.instructor}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Date &amp; Time
                </p>
                <p className="text-foreground font-medium">
                  {liveClass.date} at {liveClass.time}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Duration
                </p>
                <p className="text-foreground font-medium">{liveClass.duration}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Attendees
                </p>
                <p className="text-foreground font-medium">{liveClass.attendees} participants</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              {liveClass.status === 'live' && user && liveClass.meetingLink && (
                <Button onClick={handleJoin} className="w-full">
                  Join Now <ExternalLink className="size-4 ml-2" />
                </Button>
              )}
              {liveClass.status === 'upcoming' && (
                <div className="bg-yellow-50 dark:bg-yellow-950 rounded p-2 text-center">
                  <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-300">
                    Upcoming Session
                  </p>
                </div>
              )}
              {liveClass.status === 'ended' && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-center">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Class Ended
                  </p>
                </div>
              )}
            </div>

            {!user && (
              <Link href="/login">
                <Button className="w-full mt-4">Sign in to Join</Button>
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
