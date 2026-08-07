import type { Timestamp } from 'firebase/firestore'

export interface CourseLesson {
  id?: string
  Title?: string
  Description?: string
  Note?: string
  Link?: string
  title?: string
  duration?: string | number
  videoUrl?: string
}

export interface CourseRecord {
  id: string
  title?: string
  Course?: string
  category?: string
  instructor?: string
  image?: string
  thumbnail?: string
  youtubeUrl?: string
  lessons?: number
  duration?: string | number
  progress?: number
  rating?: number
  students?: number
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string
  allCourse?: CourseLesson[]
}

export interface CourseProgress {
  courseId: string
  progress: number
  enrolledAt?: Timestamp | null
  completedAt?: Timestamp | null
  lastAccessedAt?: Timestamp | null
  status: 'in-progress' | 'completed' | 'paused'
  videosWatched?: string[]
  timesWatched?: number
  lastWatchedLessonIndex?: number
  lastLessonTitle?: string
}

export interface VideoWatch {
  videoId: string
  courseId?: string
  lessonIndex?: number
  watchedAt?: Timestamp | null
  progress: number
  duration: number
  completed: boolean
  totalWatchTime: number
  lastPosition?: number
  lastWatchedAt?: Timestamp | null
}

export interface LearningStats {
  completedCourses: number
  inProgressCourses: number
  totalCourses: number
  totalLearnedHours: number
  totalVideosWatched: number
  totalWatchTime: number
  averageProgress: number
  achievements: number
}

export interface EnrolledCourseViewModel extends CourseRecord {
  progress: number
  status: 'In Progress' | 'Completed'
  isCompleted: boolean
  lastWatchedLessonIndex: number
  currentLessonTitle: string
  lastAccessedAt?: Timestamp | null
}

