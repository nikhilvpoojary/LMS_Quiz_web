import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase/firebase'
import type { TeacherRequest, TeacherRequestStatus } from '../types/school'

interface TeacherRequestsState {
  error: string | null
  loading: boolean
  requests: TeacherRequest[]
}

const toTeacherRequest = (id: string, data: DocumentData): TeacherRequest => ({
  id,
  email: String(data.email ?? ''),
  fullName: String(data.fullName ?? 'Unnamed teacher'),
  joinedDate: data.joinedDate,
  requestedDate: data.requestedDate,
  schoolId: String(data.schoolId ?? ''),
  schoolName: String(data.schoolName ?? ''),
  status: (data.status ?? 'pending') as TeacherRequestStatus,
  subjects: Array.isArray(data.subjects) ? data.subjects.map(String) : [],
})

const getRequestTime = (request: TeacherRequest) =>
  request.requestedDate?.toMillis?.() ?? 0

export function useTeacherRequests(
  schoolId?: string,
  status?: TeacherRequestStatus,
): TeacherRequestsState {
  const constraints = useMemo<QueryConstraint[]>(() => {
    const activeConstraints: QueryConstraint[] = []

    if (schoolId) {
      activeConstraints.push(where('schoolId', '==', schoolId))
    }

    if (status) {
      activeConstraints.push(where('status', '==', status))
    }

    return activeConstraints
  }, [schoolId, status])

  const [state, setState] = useState<TeacherRequestsState>({
    error: null,
    loading: true,
    requests: [],
  })

  useEffect(() => {
    if (!schoolId) {
      return undefined
    }

    const requestsQuery = query(collection(db, 'teacherRequests'), ...constraints)

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const requests = snapshot.docs
          .map((requestDoc) => toTeacherRequest(requestDoc.id, requestDoc.data()))
          .sort(
            (firstRequest, secondRequest) =>
              getRequestTime(secondRequest) - getRequestTime(firstRequest),
          )

        setState({ error: null, loading: false, requests })
      },
      (error) => {
        setState({ error: error.message, loading: false, requests: [] })
      },
    )

    return unsubscribe
  }, [constraints, schoolId])

  if (!schoolId) {
    return { error: null, loading: false, requests: [] }
  }

  return state
}
