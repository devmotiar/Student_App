import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  profileImage?: string
  createdAt: Timestamp
  enrolledCourses: string[]
  role: 'student' | 'instructor' | 'admin'
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  try {
    // Enable persistence
    await setPersistence(auth, browserLocalPersistence)

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile
    await updateProfile(user, { displayName })

    // Create user profile document
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName,
      createdAt: Timestamp.now(),
      enrolledCourses: [],
      role: 'student',
    }

    // Save to Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile)

    return userProfile
  } catch (error: any) {
    // Network errors
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.')
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.')
    }
    // Email errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already in use')
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format')
    }
    // Password errors
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Use at least 6 characters')
    }
    // Firebase configuration errors
    if (error.code === 'auth/invalid-api-key' || error.code === 'auth/app-not-authorized') {
      throw new Error('Firebase configuration error. Please contact support.')
    }
    throw new Error(error.message || 'Failed to sign up')
  }
}

/**
 * Sign in user with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    // Enable persistence
    await setPersistence(auth, browserLocalPersistence)

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    // Network errors
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.')
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.')
    }
    // Authentication errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found')
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password')
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format')
    }
    // Firebase configuration errors
    if (error.code === 'auth/invalid-api-key' || error.code === 'auth/app-not-authorized') {
      throw new Error('Firebase configuration error. Please contact support.')
    }
    throw new Error(error.message || 'Failed to sign in')
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out')
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found with this email')
    }
    throw new Error(error.message || 'Failed to send reset email')
  }
}

/**
 * Get current user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid))
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user profile')
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, updates, { merge: true })
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile')
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Enroll user in a course
 */
export async function enrollInCourse(userId: string, courseId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const enrolledCourses = userSnap.data().enrolledCourses || []
      if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId)
        await setDoc(userRef, { enrolledCourses }, { merge: true })

        // Initialize progress tracking
        const progressRef = doc(db, 'userProgress', userId, 'courseProgress', courseId)
        await setDoc(progressRef, {
          courseId,
          progress: 0,
          enrolledAt: Timestamp.now(),
          lastAccessedAt: Timestamp.now(),
          status: 'in-progress',
        })
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to enroll in course')
  }
}

/**
 * Check if user is enrolled in course
 */
export async function isEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId))
    return userSnap.exists() && userSnap.data().enrolledCourses?.includes(courseId) || false
  } catch (error) {
    return false
  }
}
