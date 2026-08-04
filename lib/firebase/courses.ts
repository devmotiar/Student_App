import 'server-only'
import { cache } from 'react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase' // ⚠️ update this to your actual firebase init path/export

export interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl: string
}

export interface CourseDoc {
  id: string
  title: string
  instructor: string
  description: string
  longDescription?: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  thumbnail: string
  youtubeUrl: string
  rating: number
  students: number
  lessons: Lesson[]
  learningOutcomes?: string[]
  requirements?: string[]
}

export const getCourseById = cache(async (id: string): Promise<CourseDoc | null> => {
  if (!id) return null

  const snap = await getDoc(doc(db, 'courses', id))
  if (!snap.exists()) return null

  return { id: snap.id, ...(snap.data() as Omit<CourseDoc, 'id'>) }
})

export const getAllCourses = cache(async (): Promise<CourseDoc[]> => {
  const snap = await getDocs(collection(db, 'courses'))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CourseDoc, 'id'>) }))
})