import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

export interface Material {
  id: string
  courseId: string
  title: string
  description?: string
  type: 'pdf' | 'doc' | 'link' | 'video' | 'resource'
  url: string
  fileSize?: number
  uploadedBy: string
  uploadedAt: Timestamp
  downloadCount: number
}

export interface UserDownload {
  userId: string
  materialId: string
  materialTitle: string
  downloadedAt: Timestamp
  fileSize?: number
  type: string
}

/**
 * Get all materials for a course
 */
export async function getCourseMaterials(courseId: string): Promise<Material[]> {
  try {
    const materialsCollection = collection(db, 'materials')
    const q = query(materialsCollection, where('courseId', '==', courseId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data() as Material)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch materials')
  }
}

/**
 * Get all materials available to user
 */
export async function getAllMaterials(): Promise<Material[]> {
  try {
    const materialsCollection = collection(db, 'materials')
    const snapshot = await getDocs(materialsCollection)
    return snapshot.docs.map((doc) => doc.data() as Material)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch materials')
  }
}

/**
 * Track material download
 */
export async function trackMaterialDownload(
  userId: string,
  material: Material
): Promise<void> {
  try {
    const downloadRef = doc(
      db,
      'userDownloads',
      userId,
      'downloads',
      material.id
    )

    await setDoc(downloadRef, {
      userId,
      materialId: material.id,
      materialTitle: material.title,
      downloadedAt: Timestamp.now(),
      fileSize: material.fileSize,
      type: material.type,
    })

    // Update download count
    const materialRef = doc(db, 'materials', material.id)
    await setDoc(
      materialRef,
      { downloadCount: material.downloadCount + 1 },
      { merge: true }
    )
  } catch (error: any) {
    throw new Error(error.message || 'Failed to track download')
  }
}

/**
 * Get user's download history
 */
export async function getUserDownloadHistory(userId: string): Promise<UserDownload[]> {
  try {
    const downloadCollection = collection(db, 'userDownloads', userId, 'downloads')
    const snapshot = await getDocs(downloadCollection)
    return snapshot.docs.map((doc) => doc.data() as UserDownload)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch download history')
  }
}

/**
 * Create a material record (admin function)
 */
export async function createMaterial(
  courseId: string,
  materialData: Omit<Material, 'id' | 'uploadedAt' | 'downloadCount'>
): Promise<string> {
  try {
    const materialId = `${courseId}-${Date.now()}`
    const materialRef = doc(db, 'materials', materialId)

    await setDoc(materialRef, {
      id: materialId,
      ...materialData,
      uploadedAt: Timestamp.now(),
      downloadCount: 0,
    })

    return materialId
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create material')
  }
}

/**
 * Listen to materials for a course in real-time
 */
export function onCourseMaterialsChange(
  courseId: string,
  callback: (materials: Material[]) => void
): () => void {
  const materialsCollection = collection(db, 'materials')
  const q = query(materialsCollection, where('courseId', '==', courseId))

  return onSnapshot(q, (snapshot) => {
    const materials = snapshot.docs.map((doc) => doc.data() as Material)
    callback(materials)
  })
}
