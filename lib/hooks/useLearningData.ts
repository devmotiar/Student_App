'use client'

import { useEffect, useState } from 'react'
import {
  subscribeToCourseProgress,
  subscribeToVideoWatchHistory,
} from '@/lib/firebase-progress-operations'
import type { CourseProgress, VideoWatch } from '@/lib/learning-types'

export function useCourseProgress(userId: string | undefined) {
  const [data, setData] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const loadingTimeout = setTimeout(() => {
      setError(new Error('Timed out loading course progress.'))
      setLoading(false)
    }, 8000)
    const unsubscribe = subscribeToCourseProgress(
      userId,
      (progress) => {
        clearTimeout(loadingTimeout)
        setData(progress)
        setLoading(false)
      },
      (listenerError) => {
        clearTimeout(loadingTimeout)
        setError(listenerError)
        setLoading(false)
      }
    )
    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [userId])

  return { data, loading, error }
}

export function useVideoWatchHistory(userId: string | undefined) {
  const [data, setData] = useState<VideoWatch[]>([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const loadingTimeout = setTimeout(() => {
      setError(new Error('Timed out loading watch history.'))
      setLoading(false)
    }, 8000)
    const unsubscribe = subscribeToVideoWatchHistory(
      userId,
      (history) => {
        clearTimeout(loadingTimeout)
        setData(history)
        setLoading(false)
      },
      (listenerError) => {
        clearTimeout(loadingTimeout)
        setError(listenerError)
        setLoading(false)
      }
    )
    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [userId])

  return { data, loading, error }
}
