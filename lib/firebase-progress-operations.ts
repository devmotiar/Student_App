import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

export interface CourseProgress {
  courseId: string
  progress: number
  enrolledAt: Timestamp
  completedAt?: Timestamp
  lastAccessedAt: Timestamp
  status: 'in-progress' | 'completed' | 'paused'
  videosWatched: string[]
  timesWatched: number
}

export interface VideoWatch {
  videoId: string
  watchedAt: Timestamp
  progress: number
  duration: number
  completed: boolean
  totalWatchTime: number
  lastWatchedAt: Timestamp
}

export interface UserAchievement {
  achievementId: string
  name: string
  description: string
  earnedAt: Timestamp
  badge: string
  type: 'milestone' | 'course' | 'streak' | 'certificate'
}

/**
 * Update course progress
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number
): Promise<void> {
  try {
    const progressRef = doc(db, 'userProgress', userId, 'courseProgress', courseId)
    await updateDoc(progressRef, {
      progress: Math.min(100, Math.max(0, progress)),
      lastAccessedAt: Timestamp.now(),
      status: progress >= 100 ? 'completed' : 'in-progress',
      completedAt: progress >= 100 ? Timestamp.now() : null,
    })
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
  watchProgress: number,
  duration: number
): Promise<void> {
  try {
    const videoWatchRef = doc(db, 'userProgress', userId, 'videoWatches', videoId)
    const watchSnap = await getDoc(videoWatchRef)

    const isCompleted = watchProgress >= duration * 0.9 // 90% watched

    if (watchSnap.exists()) {
      const existingData = watchSnap.data()
      await updateDoc(videoWatchRef, {
        progress: watchProgress,
        completed: isCompleted,
        lastWatchedAt: Timestamp.now(),
        totalWatchTime: (existingData.totalWatchTime || 0) + 1,
      })
    } else {
      await setDoc(videoWatchRef, {
        videoId,
        watchedAt: Timestamp.now(),
        progress: watchProgress,
        duration,
        completed: isCompleted,
        totalWatchTime: 1,
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
    await updateDoc(videoWatchRef, {
      completed: true,
      completedAt: Timestamp.now(),
    })
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
export async function getLearningStats(userId: string) {
  try {
    const allProgress = await getAllCourseProgress(userId)
    const allWatches = await getVideoWatchHistory(userId)
    const achievements = await getUserAchievements(userId)

    const completedCourses = allProgress.filter((p) => p.status === 'completed').length
    const inProgressCourses = allProgress.filter((p) => p.status === 'in-progress').length
    const totalVideosWatched = allWatches.filter((w) => w.completed).length
    const totalWatchTime = allWatches.reduce((sum, w) => sum + w.totalWatchTime, 0)
    const averageProgress =
      allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p.progress, 0) / allProgress.length)
        : 0

    return {
      completedCourses,
      inProgressCourses,
      totalCourses: allProgress.length,
      totalVideosWatched,
      totalWatchTime,
      averageProgress,
      achievements: achievements.length,
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to calculate stats')
  }
}
