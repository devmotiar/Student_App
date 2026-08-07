import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  CourseProgress,
  CourseRecord,
  LearningStats,
  VideoWatch,
} from './learning-types'

export type { CourseProgress, LearningStats, VideoWatch } from './learning-types'

export interface UserAchievement {
  achievementId: string
  name: string
  description: string
  earnedAt: Timestamp
  badge: string
  type: 'milestone' | 'course' | 'streak' | 'certificate'
}

/**
 * Parse a duration string or number into decimal hours.
 * Supports formats like:
 * - "18h 30m", "18h", "30m"
 * - "90 min", "45 mins", "60m"
 * - "24:15" (minutes:seconds) or "1:30:00" (hours:minutes:seconds)
 * - Raw numeric hours (e.g. 18.5)
 */
export function parseDurationToHours(duration: string | number | undefined | null): number {
  if (duration === undefined || duration === null || duration === '') return 0

  if (typeof duration === 'number') {
    return isNaN(duration) ? 0 : Math.max(0, duration)
  }

  const str = String(duration).trim().toLowerCase()

  // Format: "1:30:00" or "24:15"
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseFloat(p) || 0)
    if (parts.length === 3) {
      return parts[0] + parts[1] / 60 + parts[2] / 3600
    }
    if (parts.length === 2) {
      // mm:ss
      return parts[0] / 60 + parts[1] / 3600
    }
  }

  // Format: "18h 30m" / "18 hrs 30 mins" / "18h"
  let hours = 0
  let minutes = 0

  const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/)
  if (hourMatch) {
    hours = parseFloat(hourMatch[1]) || 0
  }

  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/)
  if (minMatch) {
    minutes = parseFloat(minMatch[1]) || 0
  }

  if (hourMatch || minMatch) {
    return hours + minutes / 60
  }

  // Fallback: pure number in string
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

/**
 * Calculate total hours learned based on course progress and total duration.
 */
export function calculateLearnedHours(
  progressPercent: number | undefined | null,
  duration: string | number | undefined | null
): number {
  const progress = Math.min(100, Math.max(0, Number(progressPercent) || 0))
  const totalHours = parseDurationToHours(duration)
  return (progress / 100) * totalHours
}

/** Resolve a course duration without inventing a fallback value. */
export function getCourseDurationHours(course: CourseRecord | undefined): number {
  const courseDuration = parseDurationToHours(course?.duration)
  if (courseDuration > 0) return courseDuration

  return (course?.allCourse || []).reduce(
    (total, lesson) => total + parseDurationToHours(lesson.duration),
    0
  )
}

export function getCourseProgressStatus(progressPercent: number | undefined | null) {
  return (Number(progressPercent) || 0) >= 100 ? ('Completed' as const) : ('In Progress' as const)
}

/** Calculate the hybrid learned-hours value for one course. */
export function calculateHybridLearnedHours(
  progressPercent: number | undefined | null,
  duration: string | number | undefined | null,
  exactWatchSeconds = 0
): number {
  const totalHours = parseDurationToHours(duration)
  if (totalHours <= 0) return 0

  const progressHours = calculateLearnedHours(progressPercent, duration)
  const watchHours = Math.max(0, Number(exactWatchSeconds) || 0) / 3600
  return Math.min(totalHours, Math.max(progressHours, watchHours))
}

/** Format small playback totals without rounding them down to zero hours. */
export function formatLearningHours(hours: number | undefined | null): string {
  const normalizedHours = Math.max(0, Number(hours) || 0)
  if (normalizedHours === 0) return '0'
  return normalizedHours < 1
    ? normalizedHours.toFixed(2)
    : normalizedHours.toFixed(1)
}

/**
 * Update course progress
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number,
  additionalData?: {
    lastWatchedLessonIndex?: number
    lastLessonTitle?: string
    status?: 'in-progress' | 'completed' | 'paused'
  }
): Promise<void> {
  try {
    const progressRef = doc(db, 'userProgress', userId, 'courseProgress', courseId)
    const normalizedProgress = Math.min(100, Math.max(0, progress))
    const status =
      additionalData?.status || (normalizedProgress >= 100 ? 'completed' : 'in-progress')

    await setDoc(
      progressRef,
      {
        courseId,
        progress: normalizedProgress,
        lastAccessedAt: Timestamp.now(),
        status,
        completedAt: normalizedProgress >= 100 ? Timestamp.now() : null,
        ...(additionalData?.lastWatchedLessonIndex !== undefined
          ? { lastWatchedLessonIndex: additionalData.lastWatchedLessonIndex }
          : {}),
        ...(additionalData?.lastLessonTitle
          ? { lastLessonTitle: additionalData.lastLessonTitle }
          : {}),
      },
      { merge: true }
    )
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update course progress')
  }
}

/**
 * Track video watch
 */
export async function trackVideoWatch(
  userId: string,
  videoId: string,
  currentTime: number,
  duration: number,
  metadata?: { courseId?: string; lessonIndex?: number }
): Promise<void> {
  try {
    const videoWatchRef = doc(db, 'userProgress', userId, 'videoWatches', videoId)
    const watchSnap = await getDoc(videoWatchRef)

    const normalizedTime = Math.min(Math.max(0, currentTime), Math.max(0, duration))
    const isCompleted = normalizedTime >= duration * 0.9 // 90% watched
    const previousPosition = watchSnap.exists()
      ? Number(watchSnap.data().lastPosition ?? 0)
      : 0
    // Ignore large forward seeks so watch time represents elapsed playback, not seeking.
    const elapsedSinceLastSave = watchSnap.exists()
      ? Math.min(30, Math.max(0, normalizedTime - previousPosition))
      : normalizedTime

    if (watchSnap.exists()) {
      const existingData = watchSnap.data()
      await updateDoc(videoWatchRef, {
        progress: normalizedTime,
        completed: isCompleted,
        lastWatchedAt: Timestamp.now(),
        lastPosition: normalizedTime,
        totalWatchTime: Math.min(
          duration,
          Number(existingData.totalWatchTime || 0) + elapsedSinceLastSave
        ),
        ...(metadata?.courseId ? { courseId: metadata.courseId } : {}),
        ...(metadata?.lessonIndex !== undefined ? { lessonIndex: metadata.lessonIndex } : {}),
      })
    } else {
      await setDoc(videoWatchRef, {
        videoId,
        ...(metadata?.courseId ? { courseId: metadata.courseId } : {}),
        ...(metadata?.lessonIndex !== undefined ? { lessonIndex: metadata.lessonIndex } : {}),
        watchedAt: Timestamp.now(),
        progress: normalizedTime,
        duration,
        completed: isCompleted,
        totalWatchTime: Math.min(duration, elapsedSinceLastSave),
        lastPosition: normalizedTime,
        lastWatchedAt: Timestamp.now(),
      })
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to track video watch')
  }
}

/**
 * Mark video as completed
 */
export async function markVideoCompleted(userId: string, videoId: string): Promise<void> {
  try {
    const videoWatchRef = doc(db, 'userProgress', userId, 'videoWatches', videoId)
    await setDoc(videoWatchRef, {
      completed: true,
      completedAt: Timestamp.now(),
    }, { merge: true })
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark video as completed')
  }
}

/**
 * Get course progress
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgress | null> {
  try {
    const progressRef = doc(db, 'userProgress', userId, 'courseProgress', courseId)
    const progressSnap = await getDoc(progressRef)
    return progressSnap.exists() ? (progressSnap.data() as CourseProgress) : null
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch course progress')
  }
}

/**
 * Get all user progress
 */
export async function getAllCourseProgress(userId: string): Promise<CourseProgress[]> {
  try {
    const progressCollection = collection(db, 'userProgress', userId, 'courseProgress')
    const snapshot = await getDocs(progressCollection)
    return snapshot.docs.map((doc) => doc.data() as CourseProgress)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch progress')
  }
}

/**
 * Get video watch history
 */
export async function getVideoWatchHistory(userId: string): Promise<VideoWatch[]> {
  try {
    const watchCollection = collection(db, 'userProgress', userId, 'videoWatches')
    const snapshot = await getDocs(watchCollection)
    return snapshot.docs.map((doc) => doc.data() as VideoWatch)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch watch history')
  }
}

/**
 * Listen to course progress in real-time
 */
export function onCourseProgressChange(
  userId: string,
  courseId: string,
  callback: (progress: CourseProgress | null) => void
): () => void {
  const progressRef = doc(db, 'userProgress', userId, 'courseProgress', courseId)
  return onSnapshot(progressRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as CourseProgress) : null)
  })
}

/** Listen to all course-progress records for a user in real time. */
export function subscribeToCourseProgress(
  userId: string,
  callback: (progress: CourseProgress[]) => void,
  onError?: (error: Error) => void
): () => void {
  const progressCollection = collection(db, 'userProgress', userId, 'courseProgress')
  return onSnapshot(
    progressCollection,
    (snapshot) => callback(snapshot.docs.map((item) => item.data() as CourseProgress)),
    (error) => onError?.(error as Error)
  )
}

/** Listen to all video-watch records for a user in real time. */
export function subscribeToVideoWatchHistory(
  userId: string,
  callback: (history: VideoWatch[]) => void,
  onError?: (error: Error) => void
): () => void {
  const watchCollection = collection(db, 'userProgress', userId, 'videoWatches')
  return onSnapshot(
    watchCollection,
    (snapshot) => callback(snapshot.docs.map((item) => item.data() as VideoWatch)),
    (error) => onError?.(error as Error)
  )
}

/**
 * Award achievement
 */
export async function awardAchievement(
  userId: string,
  achievement: Omit<UserAchievement, 'earnedAt'>
): Promise<void> {
  try {
    const achievementRef = doc(
      db,
      'userProgress',
      userId,
      'achievements',
      achievement.achievementId
    )
    await setDoc(achievementRef, {
      ...achievement,
      earnedAt: Timestamp.now(),
    })
  } catch (error: any) {
    throw new Error(error.message || 'Failed to award achievement')
  }
}

/**
 * Get all user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const achievementCollection = collection(db, 'userProgress', userId, 'achievements')
    const snapshot = await getDocs(achievementCollection)
    return snapshot.docs.map((doc) => doc.data() as UserAchievement)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch achievements')
  }
}

/**
 * Calculate learning statistics
 */
export function calculateLearningStats(
  progressList: CourseProgress[],
  watchHistory: VideoWatch[],
  coursesList: CourseRecord[],
  enrolledCourseIds?: string[]
): LearningStats {
  const enrolledIds = enrolledCourseIds
    ? [...new Set(enrolledCourseIds)]
    : [...new Set(progressList.map((progress) => progress.courseId))]
  const enrolledSet = new Set(enrolledIds)
  const enrolledProgress = progressList.filter((progress) => enrolledSet.has(progress.courseId))
  const enrolledWatches = watchHistory.filter(
    (watch) => Boolean(watch.courseId && enrolledSet.has(watch.courseId))
  )

  const watchesByCourse = new Map<string, number>()
  const observedDurationsByCourse = new Map<string, number>()
  for (const watch of enrolledWatches) {
    if (!watch.courseId) continue
    watchesByCourse.set(
      watch.courseId,
      (watchesByCourse.get(watch.courseId) || 0) + Math.max(0, Number(watch.totalWatchTime) || 0)
    )
    observedDurationsByCourse.set(
      watch.courseId,
      (observedDurationsByCourse.get(watch.courseId) || 0) +
        Math.max(0, Number(watch.duration) || 0)
    )
  }

  const progressByCourse = new Map(
    enrolledProgress.map((progress) => [progress.courseId, progress])
  )

  let totalLearnedHours = 0
  for (const courseId of enrolledIds) {
    const progress = progressByCourse.get(courseId)
    const course = coursesList.find((item) => item.id === courseId)
    const catalogDuration = getCourseDurationHours(course)
    const observedDuration = (observedDurationsByCourse.get(courseId) || 0) / 3600
    totalLearnedHours += calculateHybridLearnedHours(
      progress?.progress || 0,
      catalogDuration || observedDuration,
      watchesByCourse.get(courseId) || 0
    )
  }

  const normalizedProgress = enrolledIds.map((courseId) =>
    Math.min(100, Math.max(0, Number(progressByCourse.get(courseId)?.progress) || 0))
  )
  const completedCourses = normalizedProgress.filter((progress) => progress >= 100).length

  return {
    completedCourses,
    inProgressCourses: enrolledIds.length - completedCourses,
    totalCourses: enrolledIds.length,
    // Keep hundredths so short sessions (for example 90 seconds = 0.03h)
    // remain visible in the dashboard instead of becoming 0.0h.
    totalLearnedHours: Math.round(totalLearnedHours * 100) / 100,
    totalVideosWatched: enrolledWatches.filter((watch) => watch.completed).length,
    totalWatchTime: enrolledWatches.reduce(
      (sum, watch) => sum + Math.max(0, Number(watch.totalWatchTime) || 0),
      0
    ),
    averageProgress: normalizedProgress.length
      ? Math.round(normalizedProgress.reduce((sum, progress) => sum + progress, 0) / normalizedProgress.length)
      : 0,
    achievements: 0,
  }
}

export async function getLearningStats(
  userId: string,
  coursesList: CourseRecord[] = [],
  enrolledCourseIds?: string[]
): Promise<LearningStats> {
  try {
    const allProgress = await getAllCourseProgress(userId)
    const allWatches = await getVideoWatchHistory(userId)
    const achievements = await getUserAchievements(userId)
    return {
      ...calculateLearningStats(allProgress, allWatches, coursesList, enrolledCourseIds),
      achievements: achievements.length,
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to calculate stats')
  }
}
