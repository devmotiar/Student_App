'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, Calendar, Clock, Download, Share2 } from 'lucide-react'

import { useFirebaseDocument } from '@/lib/hooks/useFirebaseData'
import { useAuth } from '@/lib/hooks/useAuth'
import { trackVideoWatch, markVideoCompleted } from '@/lib/firebase-progress-operations'
import { VideoPlayer } from '@/components/video-player'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface RecordedVideo {
  id: string
  title: string
  course: string
  instructor: string
  duration: string
  views: number
  uploaded: string
  watched?: boolean
  videoUrl?: string
  description?: string
  transcript?: string
  materials?: Array<{ name: string; url: string }>
}

export default function RecordedVideoDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { data: rawVideo, loading } = useFirebaseDocument<RecordedVideo>('recordedVideos', params.id)
  const [isWatched, setIsWatched] = useState(false)
  const [watchProgress, setWatchProgress] = useState(0)

  const video = rawVideo
    ? {
        ...rawVideo,
        description:
          rawVideo.description ||
          `In this video, ${rawVideo.instructor} covers the key concepts of ${rawVideo.title}. Perfect for learners who want to understand this topic in depth.`,
        materials: rawVideo.materials || [],
      }
    : null

  // Sync the "watched" flag whenever the underlying document changes
  useEffect(() => {
    setIsWatched(rawVideo?.watched || false)
  }, [rawVideo?.watched])

  const handleVideoProgress = async (currentTime: number, duration: number) => {
    const progress = (currentTime / duration) * 100
    setWatchProgress(progress)

    // Track progress periodically
    if (user && Math.floor(currentTime) % 5 === 0) {
      try {
        await trackVideoWatch(user.uid, params.id, currentTime, duration)
      } catch (err) {
        console.error('[v0] Failed to track video:', err)
      }
    }
  }

  const handleVideoCompleted = async () => {
    if (!user) return

    try {
      await markVideoCompleted(user.uid, params.id)
      setIsWatched(true)
      console.log('[v0] Video marked as completed')
    } catch (err) {
      console.error('[v0] Failed to mark as completed:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Video not found</p>
        <Link href="/recorded-videos">
          <Button variant="outline">Back to Videos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Back button */}
      <Link href="/recorded-videos">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Videos
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Video player */}
          <div className="mb-6">
            {video.videoUrl ? (
              <VideoPlayer
                videoUrl={video.videoUrl}
                title={video.title}
                onProgress={handleVideoProgress}
                onCompleted={handleVideoCompleted}
                autoPlay={false}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-black text-sm text-slate-400">
                No video file has been uploaded for this lesson yet.
              </div>
            )}
          </div>

          {/* Video info */}
          <Card className="p-6 mb-6">
            {isWatched && (
              <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 flex gap-2 mb-4">
                <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                  Video completed
                </p>
              </div>
            )}

            <h1 className="text-3xl font-bold text-foreground mb-3">{video.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                {video.views.toLocaleString()} views
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                Uploaded {video.uploaded}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                {video.duration}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">By {video.instructor}</p>
              <p className="text-muted-foreground mb-2">In {video.course}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Watch progress</span>
                <span className="text-xs font-semibold">{Math.round(watchProgress)}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="size-4 mr-2" />
                Share
              </Button>
              {video.materials && video.materials.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="size-4 mr-2" />
                  Resources
                </Button>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-3">About this video</h2>
            <p className="text-foreground mb-4">{video.description}</p>
          </Card>

          {/* Materials */}
          {video.materials && video.materials.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Download className="size-5" />
                Video Materials
              </h2>
              <div className="space-y-2">
                {video.materials.map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url}
                    download
                    className="block p-3 rounded border border-border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-sm font-medium text-primary hover:underline"
                  >
                    📄 {material.name}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Transcript */}
          {video.transcript && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3">Transcript</h2>
              <p className="text-foreground text-sm leading-relaxed">{video.transcript}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Video Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Course
                </p>
                <Link href={`/courses`} className="text-primary hover:underline font-medium">
                  {video.course}
                </Link>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Instructor
                </p>
                <p className="text-foreground font-medium">{video.instructor}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Duration
                </p>
                <p className="text-foreground font-medium">{video.duration}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Views
                </p>
                <p className="text-foreground font-medium">{video.views.toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t border-border">
                {isWatched ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 flex gap-2">
                    <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                      Watched
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Watch the video to mark as complete</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
