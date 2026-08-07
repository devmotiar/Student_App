import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  Timestamp,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Add a new document to a collection
export async function addDocument(
  collectionName: string,
  data: DocumentData
) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error)
    throw error
  }
}

// Update an existing document
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: DocumentData
) {
  try {
    const docRef = doc(db, collectionName, documentId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    throw error
  }
}

// Delete a document
export async function deleteDocument(
  collectionName: string,
  documentId: string
) {
  try {
    const docRef = doc(db, collectionName, documentId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    throw error
  }
}

// Update course progress
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number
) {
  try {
    const progressRef = doc(db, `users/${userId}/courses`, courseId)
    await updateDoc(progressRef, {
      progress: Math.min(100, Math.max(0, progress)),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating course progress:', error)
    throw error
  }
}

// Mark video as watched
export async function markVideoWatched(
  userId: string,
  videoId: string
) {
  try {
    const videoRef = doc(db, `users/${userId}/videos`, videoId)
    await updateDoc(videoRef, {
      watched: true,
      watchedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error marking video as watched:', error)
    throw error
  }
}

// Join a live class
export async function joinLiveClass(
  userId: string,
  liveClassId: string
) {
  try {
    const classRef = doc(db, `liveClasses/${liveClassId}`)
    await updateDoc(classRef, {
      attendees: increment(1),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error joining live class:', error)
    throw error
  }
}

// Batch update documents (for updating live class attendees count)
export async function incrementLiveClassAttendees(
  liveClassId: string
) {
  try {
    const { increment } = await import('firebase/firestore')
    const classRef = doc(db, 'liveClasses', liveClassId)
    await updateDoc(classRef, {
      attendees: increment(1),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error incrementing live class attendees:', error)
    throw error
  }
}
