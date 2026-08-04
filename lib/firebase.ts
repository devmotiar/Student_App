import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration - uses actual values or emulator mode
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate config
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (val) => val && val !== 'undefined' && !val.includes('undefined')
)

if (!isFirebaseConfigured) {
  console.warn(
    '[Firebase] Missing or invalid credentials. Create a .env.local file in the project root ' +
      '(copy .env.example) and fill in your real Firebase project values, then restart the dev server.'
  )
}

// Initialize Firebase
let app: any
let db: any
let auth: any
let storage: any
export let firebaseInitError: string | null = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)

    // Initialize Firestore with proper settings
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    })

    // Initialize Auth
    auth = getAuth(app)

    // Initialize Storage (for uploading recorded video files)
    storage = getStorage(app)
  } catch (error) {
    // Don't crash the whole app (e.g. a Next.js 500 page) just because Firebase
    // couldn't initialize (e.g. the API key is a placeholder/invalid value).
    // Downstream code should check `isFirebaseConfigured` / `firebaseInitError`
    // or handle `auth`/`db`/`storage` being undefined.
    console.error('[Firebase] Initialization error:', error)
    firebaseInitError =
      error instanceof Error ? error.message : 'Failed to initialize Firebase'
  }
}

// Connect to emulator if enabled (development only)
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'

if (isFirebaseConfigured && useEmulator && typeof window !== 'undefined') {
  // Only connect in browser environment to emulator
  const connectEmulators = async () => {
    try {
      // Check if already connected
      if ((auth as any).emulatorConfig || (db as any)._settings.experimentalForceLongPolling) {
        return
      }

      // Connect Auth Emulator
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true,
      })

      // Connect Firestore Emulator
      connectFirestoreEmulator(db, 'localhost', 8080)

      // Connect Storage Emulator
      connectStorageEmulator(storage, 'localhost', 9199)
      
    } catch (error: any) {
      // Silently fail - emulator may not be running
      // App will use production credentials if available
    }
  }

  // Delay connection to ensure auth is ready
  if (typeof window !== 'undefined') {
    setTimeout(() => connectEmulators(), 100)
  }
}

export { db, auth, app, storage }
export default app
