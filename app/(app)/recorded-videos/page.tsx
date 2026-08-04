
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Eye, Play, Loader2, X } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'

function formatViews(views: number) {
  return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : `${views}`
}

function getYoutubeId(url?: string) {
  if (!url) return ''

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '')
    }

    return parsed.searchParams.get('v') || ''
  } catch {
    return ''
  }
}

export default function RecordedVideosPage() {
  const { data: recordedVideos, loading } = useFirebaseData('recordedVideos')

  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Recorded Videos"
          description="Catch up on lessons and rewatch them anytime, at your own pace."
        />

        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Recorded Videos"
        description="Catch up on lessons and rewatch them anytime, at your own pace."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recordedVideos.map((video: any) => {
          const isPlaying = playingVideo === video.id
          const youtubeId = getYoutubeId(video.videoUrl)

          return (
            <article
              key={video.id}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video bg-black">
                {isPlaying ? (
                  <>
                    {youtubeId ? (
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0`}
                        title={video.title}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={video.videoUrl}
                        controls
                        autoPlay
                        className="h-full w-full"
                      />
                    )}

                    <button
                      onClick={() => setPlayingVideo(null)}
                      className="absolute right-2 top-2 z-20 rounded-full bg-black/70 p-2 text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Image
                      src={video.image || '/placeholder.svg'}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />

                    <button
                      onClick={() => setPlayingVideo(video.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/30"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                        <Play className="ml-1 h-6 w-6 fill-current" />
                      </span>
                    </button>

                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                      {video.duration}
                    </span>

                    {video.watched && (
                      <Badge
                        variant="success"
                        className="absolute left-2 top-2"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Watched
                      </Badge>
                    )}
                  </>
                )}
              </div>

              <Link href={`/recorded-videos/${video.id}`}>
                <div className="cursor-pointer p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold">
                    {video.title}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {video.course}
                  </p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{video.instructor}</span>

                    <span>•</span>

                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {formatViews(video.views)}
                    </span>

                    <span>•</span>

                    <span>{video.uploaded}</span>
                  </div>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}
