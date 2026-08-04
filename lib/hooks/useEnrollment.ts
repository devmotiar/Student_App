'use client'

import { useEffect, useState, useCallback } from 'react'
import { isEnrolledInCourse, enrollInCourse } from '@/lib/firebase-auth-operations'

export function useEnrollment(uid: string | undefined, courseId: string) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checking, setChecking] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  const checkEnrollment = useCallback(async () => {
    if (!uid) {
      setChecking(false)
      return
    }
    try {
      const enrolled = await isEnrolledInCourse(uid, courseId)
      setIsEnrolled(enrolled)
    } catch (err) {
      console.error('[enrollment] check error:', err)
    } finally {
      setChecking(false)
    }
  }, [uid, courseId])

  useEffect(() => {
    checkEnrollment()
  }, [checkEnrollment])

  const enroll = useCallback(async () => {
    if (!uid) {
      setError('Please sign in to enroll')
      return
    }
    setEnrolling(true)
    setError('')
    try {
      await enrollInCourse(uid, courseId)
      setIsEnrolled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll')
    } finally {
      setEnrolling(false)
    }
  }, [uid, courseId])

  return { isEnrolled, checking, enrolling, error, enroll }
}