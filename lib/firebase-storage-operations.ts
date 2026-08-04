import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from '@/lib/firebase'

/**
 * Upload a file (video or thumbnail image) to Firebase Storage with progress tracking.
 * Returns the public download URL once the upload completes.
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(percent)
        },
        (error) => {
          console.error('[Storage] Upload error:', error)
          reject(new Error(error.message || 'Failed to upload file'))
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(url)
          } catch (err: any) {
            reject(new Error(err.message || 'Failed to get download URL'))
          }
        }
      )
    } catch (error: any) {
      reject(new Error(error.message || 'Failed to start upload'))
    }
  })
}

/** Upload a recorded video file. Path is namespaced under recorded-videos/{docId}/ */
export function uploadRecordedVideo(
  file: File,
  docId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return uploadFile(file, `recorded-videos/${docId}/${Date.now()}-${safeName}`, onProgress)
}

/** Upload a thumbnail image for a video or live class. */
export function uploadThumbnail(
  file: File,
  folder: string,
  docId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return uploadFile(file, `${folder}/${docId}/thumbnails/${Date.now()}-${safeName}`, onProgress)
}

/**
 * Delete a file from Firebase Storage given its https download URL or storage path.
 * Safe to call even if the file doesn't exist (e.g. it was an external URL, not a Storage file).
 */
export async function deleteFileByUrl(fileUrl: string): Promise<void> {
  try {
    if (!fileUrl || !fileUrl.includes('firebasestorage')) {
      // Not a Firebase Storage URL (likely an external link) - nothing to delete
      return
    }
    const storageRef = ref(storage, fileUrl)
    await deleteObject(storageRef)
  } catch (error) {
    // Don't block the caller if the file was already gone
    console.warn('[Storage] Could not delete file (it may not exist):', error)
  }
}
