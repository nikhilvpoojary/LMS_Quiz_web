import { collection, onSnapshot, query, type QueryConstraint } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase/firebase'

interface RealtimeCountState {
  count: number
  error: string | null
  loading: boolean
}

export function useRealtimeCount(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): RealtimeCountState {
  const [state, setState] = useState<RealtimeCountState>({
    count: 0,
    error: null,
    loading: true,
  })

  useEffect(() => {
    const collectionQuery = query(collection(db, collectionName), ...constraints)

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const count = snapshot.docs.filter(
          (snapshotDoc) => snapshotDoc.data().kind !== 'collectionBootstrap',
        ).length

        setState({ count, error: null, loading: false })
      },
      (error) => {
        setState({ count: 0, error: error.message, loading: false })
      },
    )

    return unsubscribe
  }, [collectionName, constraints])

  return state
}
