
import 'server-only'

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app'

import {
  getAuth,
  type Auth,
} from 'firebase-admin/auth'

let adminApp: App | undefined

function getAdminApp(): App {
  if (adminApp) {
    return adminApp
  }

  const existingApps = getApps()

  if (existingApps.length > 0) {
    adminApp = existingApps[0]
    return adminApp
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  )

  if (!projectId) {
    throw new Error(
      'Missing FIREBASE_PROJECT_ID environment variable'
    )
  }

  if (!clientEmail) {
    throw new Error(
      'Missing FIREBASE_CLIENT_EMAIL environment variable'
    )
  }

  if (!privateKey) {
    throw new Error(
      'Missing FIREBASE_PRIVATE_KEY environment variable'
    )
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })

  return adminApp
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

