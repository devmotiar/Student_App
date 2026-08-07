'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirebaseData<T extends DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let settled = false;
    const loadingTimeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      setError(new Error(`Timed out loading ${collectionName}. Check your Firebase connection.`));
      setLoading(false);
    }, 8000);

    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, collectionName), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          settled = true;
          clearTimeout(loadingTimeout);
          const documents: T[] = [];
          snapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() } as T & { id: string });
          });
          setData(documents);
          setLoading(false);
        },
        (err) => {
          settled = true;
          clearTimeout(loadingTimeout);
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => {
        settled = true;
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
    } catch (err) {
      settled = true;
      clearTimeout(loadingTimeout);
      console.error(`Error setting up listener for ${collectionName}:`, err);
      setError(err as Error);
      setLoading(false);
    }
  // Spread the actual constraints so the rest-parameter array itself does not
  // cause a new Firestore subscription on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, ...constraints]);

  return { data, loading, error };
}

export function useFirebaseDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string | undefined | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const loadingTimeout = setTimeout(() => {
      setError(new Error(`Timed out loading ${collectionName}/${documentId}.`));
      setLoading(false);
    }, 8000);
    const docRef = doc(db, collectionName, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        clearTimeout(loadingTimeout);
        if (docSnapshot.exists()) {
          setData({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as T & { id: string });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        clearTimeout(loadingTimeout);
        console.error(
          `Error setting up document listener for ${collectionName}/${documentId}:`,
          err
        );
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [collectionName, documentId]);

  return { data, loading, error };
}
