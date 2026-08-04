'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, getUserProfile, UserProfile } from '../firebase-auth-operations'
import { isFirebaseConfigured } from '../firebase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError(
        'Firebase is not configured. Create a .env.local file with your real Firebase project credentials (see .env.example) and restart the dev server.'
      )
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChange(async (currentUser) => {
      try {
        setUser(currentUser)
        
        if (currentUser) {
          const profile = await getUserProfile(currentUser.uid)
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
      } catch (err) {
        console.error('[v0] Auth error:', err)
        setError(err instanceof Error ? err.message : 'Auth error')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
