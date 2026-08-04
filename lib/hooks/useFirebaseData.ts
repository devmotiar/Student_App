'use client'

import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, QueryConstraint, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useFirebaseData<T extends DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), ...constraints)

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents: T[] = []
          snapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() } as T)
          })
          setData(documents)
          setLoading(false)
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err)
          setError(err as Error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error(`Error setting up listener for ${collectionName}:`, err)
      setError(err as Error)
      setLoading(false)
    }
  }, [collectionName, constraints])

  return { data, loading, error }
}

export function useFirebaseDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string | undefined | null
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!documentId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const docRef = doc(db, collectionName, documentId)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error(`Error setting up document listener for ${collectionName}/${documentId}:`, err)
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [collectionName, documentId])

  return { data, loading, error }
}
