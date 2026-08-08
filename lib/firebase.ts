import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore'
import {
  getAuth,
  connectAuthEmulator,
} from 'firebase/auth'
import {
  getStorage,
  connectStorageEmulator,
} from 'firebase/storage'

/* =========================================================
   Firebase Configuration
========================================================= */

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/* =========================================================
   Validate Configuration
========================================================= */

export const isFirebaseConfigured =
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId,
  )

if (!isFirebaseConfigured) {
  console.warn(
    '[Firebase] Firebase configuration is incomplete. Check your .env.local file.',
  )
}

/* =========================================================
   Firebase Variables
========================================================= */

let app: ReturnType<typeof initializeApp> | null =
  null

let db: ReturnType<typeof getFirestore> | null =
  null

let auth: ReturnType<typeof getAuth> | null =
  null

let storage: ReturnType<typeof getStorage> | null =
  null

export let firebaseInitError: string | null =
  null

/* =========================================================
   Initialize Firebase
========================================================= */

if (isFirebaseConfigured) {
  try {
    /*
     * Avoid initializing Firebase more than once.
     */
    app = getApps().length
      ? getApp()
      : initializeApp(firebaseConfig)

    /* -------------------------------------------------------
       Firestore
    ------------------------------------------------------- */

    try {
      db = initializeFirestore(app, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      })
    } catch (error) {
      /*
       * initializeFirestore can throw when Firestore
       * has already been initialized elsewhere.
       *
       * In that case use the existing instance.
       */
      db = getFirestore(app)
    }

    /* -------------------------------------------------------
       Authentication
    ------------------------------------------------------- */

    auth = getAuth(app)

    /* -------------------------------------------------------
       Firebase Storage
    ------------------------------------------------------- */

    storage = getStorage(app)

    console.log(
      '[Firebase] Firebase initialized successfully.',
    )

    console.log(
      '[Firebase] Project:',
      firebaseConfig.projectId,
    )

    console.log(
      '[Firebase] Storage Bucket:',
      firebaseConfig.storageBucket,
    )
  } catch (error) {
    console.error(
      '[Firebase] Initialization error:',
      error,
    )

    firebaseInitError =
      error instanceof Error
        ? error.message
        : 'Failed to initialize Firebase'
  }
}

/* =========================================================
   Emulator Configuration
========================================================= */

const useEmulator =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR ===
  'true'

/*
 * Prevent emulator connection more than once.
 */
let emulatorConnected = false

if (
  isFirebaseConfigured &&
  useEmulator &&
  typeof window !== 'undefined'
) {
  const connectEmulators = () => {
    if (
      emulatorConnected ||
      !auth ||
      !db ||
      !storage
    ) {
      return
    }

    try {
      /* -----------------------------------------------------
         Auth Emulator
      ----------------------------------------------------- */

      connectAuthEmulator(
        auth,
        'http://localhost:9099',
        {
          disableWarnings: true,
        },
      )

      /* -----------------------------------------------------
         Firestore Emulator
      ----------------------------------------------------- */

      connectFirestoreEmulator(
        db,
        'localhost',
        8080,
      )

      /* -----------------------------------------------------
         Storage Emulator
      ----------------------------------------------------- */

      connectStorageEmulator(
        storage,
        'localhost',
        9199,
      )

      emulatorConnected = true

      console.log(
        '[Firebase] Emulator connected.',
      )
    } catch (error) {
      console.warn(
        '[Firebase] Emulator connection failed.',
        error,
      )
    }
  }

  /*
   * Give Firebase time to initialize before
   * connecting to the emulators.
   */
  setTimeout(connectEmulators, 100)
}

/* =========================================================
   Exports
========================================================= */

export {
  app,
  db,
  auth,
  storage,
}

export default app