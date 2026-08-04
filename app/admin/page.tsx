'use client'

import Link from 'next/link'
import { Radio, Video, ArrowRight } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { Card } from '@/components/ui/card'

export default function AdminOverviewPage() {
  const { data: liveClasses } = useFirebaseData('liveClasses')
  const { data: recordedVideos } = useFirebaseData('recordedVideos')

  const liveNow = liveClasses.filter((c: any) => c.status === 'live').length

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your platform&apos;s live classes and recorded videos.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/admin/live-classes">
          <Card className="flex flex-col gap-4 p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Radio className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Live Classes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {liveClasses.length} total • {liveNow} live now
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/recorded-videos">
          <Card className="flex flex-col gap-4 p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Video className="size-5" />
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Recorded Videos</h2>
              <p className="mt-1 text-sm text-muted-foreground">{recordedVideos.length} total videos</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
