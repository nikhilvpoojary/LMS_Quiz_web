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
import type { School, SchoolStatus } from '../types/school'

interface SchoolsState {
  schools: School[]
  error: string | null
  loading: boolean
}

const toSchool = (id: string, data: DocumentData): School => ({
  id,
  schoolName: String(data.schoolName ?? data.name ?? 'Unnamed school'),
  principalName: String(data.principalName ?? ''),
  email: String(data.email ?? ''),
  schoolCode: typeof data.schoolCode === 'string' ? data.schoolCode : undefined,
  schoolId: typeof data.schoolId === 'string' ? data.schoolId : id,
  logoUrl: typeof data.logoUrl === 'string' ? data.logoUrl : undefined,
  status: (data.status ?? 'pending') as SchoolStatus,
  createdAt: data.createdAt,
  registrationDate: data.registrationDate,
  rejectionReason:
    typeof data.rejectionReason === 'string' ? data.rejectionReason : undefined,
  updatedAt: data.updatedAt,
})

const getRegistrationTime = (school: School) =>
  school.registrationDate?.toMillis?.() ?? 0

export function useSchools(status?: SchoolStatus): SchoolsState {
  const constraints = useMemo<QueryConstraint[]>(() => {
    const activeConstraints: QueryConstraint[] = []

    if (status) {
      activeConstraints.push(where('status', '==', status))
    }

    return activeConstraints
  }, [status])

  const [state, setState] = useState<SchoolsState>({
    schools: [],
    error: null,
    loading: true,
  })

  useEffect(() => {
    const schoolsQuery = query(collection(db, 'schools'), ...constraints)

    const unsubscribe = onSnapshot(
      schoolsQuery,
      (snapshot) => {
        const schools = snapshot.docs
          .map((schoolDoc) => toSchool(schoolDoc.id, schoolDoc.data()))
          .sort(
            (firstSchool, secondSchool) =>
              getRegistrationTime(secondSchool) -
              getRegistrationTime(firstSchool),
          )

        setState({
          schools,
          error: null,
          loading: false,
        })
      },
      (error) => {
        setState({ schools: [], error: error.message, loading: false })
      },
    )

    return unsubscribe
  }, [constraints])

  return state
}
