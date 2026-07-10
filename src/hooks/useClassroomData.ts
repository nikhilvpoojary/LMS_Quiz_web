import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { db } from '../firebase/firebase'

export interface TeacherClass {
  classId: string
  className: string
  createdAt?: { toDate?: () => Date; toMillis?: () => number }
  schoolId: string
  schoolName: string
  status: string
  teacherId: string
  teacherName: string
}

export interface StudentRequest {
  id: string
  email: string
  fullName: string
  requestedDate?: { toDate?: () => Date; toMillis?: () => number }
  schoolCode: string
  schoolId: string
  schoolName: string
  status: string
  studentId: string
}

export interface StudentProfile {
  email: string
  fullName: string
  joinedDate?: { toDate?: () => Date; toMillis?: () => number }
  schoolCode: string
  schoolId: string
  schoolName: string
  status: string
  studentId: string
}

export interface ClassMembership {
  id: string
  classId: string
  className: string
  joinedAt?: { toDate?: () => Date; toMillis?: () => number }
  lastActivityAt?: { toDate?: () => Date; toMillis?: () => number } | null
  schoolId: string
  studentId: string
  teacherId: string
}

interface RealtimeListState<T> {
  error: string | null
  loading: boolean
  records: T[]
}

interface RealtimeDocState<T> {
  error: string | null
  loading: boolean
  record: T | null
}

const timestampMillis = (value?: { toMillis?: () => number }) => value?.toMillis?.() ?? 0

const toTeacherClass = (data: DocumentData): TeacherClass => ({
  classId: String(data.classId ?? ''),
  className: String(data.className ?? ''),
  createdAt: data.createdAt,
  schoolId: String(data.schoolId ?? ''),
  schoolName: String(data.schoolName ?? ''),
  status: String(data.status ?? 'active'),
  teacherId: String(data.teacherId ?? ''),
  teacherName: String(data.teacherName ?? ''),
})

const toStudentRequest = (id: string, data: DocumentData): StudentRequest => ({
  id,
  email: String(data.email ?? ''),
  fullName: String(data.fullName ?? ''),
  requestedDate: data.requestedDate,
  schoolCode: String(data.schoolCode ?? ''),
  schoolId: String(data.schoolId ?? ''),
  schoolName: String(data.schoolName ?? ''),
  status: String(data.status ?? 'pending'),
  studentId: String(data.studentId ?? id),
})

const toStudentProfile = (id: string, data: DocumentData): StudentProfile => ({
  email: String(data.email ?? ''),
  fullName: String(data.fullName ?? ''),
  joinedDate: data.joinedDate,
  schoolCode: String(data.schoolCode ?? ''),
  schoolId: String(data.schoolId ?? ''),
  schoolName: String(data.schoolName ?? ''),
  status: String(data.status ?? 'active'),
  studentId: String(data.studentId ?? id),
})

const toClassMembership = (id: string, data: DocumentData): ClassMembership => ({
  id,
  classId: String(data.classId ?? ''),
  className: String(data.className ?? ''),
  joinedAt: data.joinedAt,
  lastActivityAt: data.lastActivityAt ?? null,
  schoolId: String(data.schoolId ?? ''),
  studentId: String(data.studentId ?? ''),
  teacherId: String(data.teacherId ?? ''),
})

function useRealtimeList<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  enabled: boolean,
  mapRecord: (id: string, data: DocumentData) => T,
  sortRecords?: (first: T, second: T) => number,
): RealtimeListState<T> {
  const [state, setState] = useState<RealtimeListState<T>>({
    error: null,
    loading: enabled,
    records: [],
  })

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const collectionQuery = query(collection(db, collectionName), ...constraints)
    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const records = snapshot.docs.map((snapshotDoc) =>
          mapRecord(snapshotDoc.id, snapshotDoc.data()),
        )

        if (sortRecords) {
          records.sort(sortRecords)
        }

        setState({ error: null, loading: false, records })
      },
      (error) => {
        setState({ error: error.message, loading: false, records: [] })
      },
    )

    return unsubscribe
  }, [collectionName, constraints, enabled, mapRecord, sortRecords])

  return enabled ? state : { error: null, loading: false, records: [] }
}

export function useTeacherClasses(teacherId?: string, schoolId?: string) {
  const constraints = useMemo<QueryConstraint[]>(
    () => (teacherId && schoolId ? [where('teacherId', '==', teacherId), where('schoolId', '==', schoolId)] : []),
    [schoolId, teacherId],
  )
  const mapClass = useCallback((_: string, data: DocumentData) => toTeacherClass(data), [])
  const sortClass = useCallback(
    (first: TeacherClass, second: TeacherClass) =>
      timestampMillis(second.createdAt) - timestampMillis(first.createdAt),
    [],
  )

  return useRealtimeList(
    'classes',
    constraints,
    Boolean(teacherId && schoolId),
    mapClass,
    sortClass,
  )
}

export function usePendingStudentRequests(schoolId?: string) {
  const constraints = useMemo<QueryConstraint[]>(
    () => (schoolId ? [where('schoolId', '==', schoolId), where('status', '==', 'pending')] : []),
    [schoolId],
  )
  const sortRequest = useCallback(
    (first: StudentRequest, second: StudentRequest) =>
      timestampMillis(second.requestedDate) - timestampMillis(first.requestedDate),
    [],
  )

  return useRealtimeList(
    'studentRequests',
    constraints,
    Boolean(schoolId),
    toStudentRequest,
    sortRequest,
  )
}

export function useTeacherClassMemberships(teacherId?: string, schoolId?: string) {
  const constraints = useMemo<QueryConstraint[]>(
    () => (teacherId && schoolId ? [where('teacherId', '==', teacherId), where('schoolId', '==', schoolId)] : []),
    [schoolId, teacherId],
  )
  const sortMembership = useCallback(
    (first: ClassMembership, second: ClassMembership) =>
      timestampMillis(second.joinedAt) - timestampMillis(first.joinedAt),
    [],
  )

  return useRealtimeList(
    'classMemberships',
    constraints,
    Boolean(teacherId && schoolId),
    toClassMembership,
    sortMembership,
  )
}

export function useStudentProfile(studentId?: string): RealtimeDocState<StudentProfile> {
  const [state, setState] = useState<RealtimeDocState<StudentProfile>>({
    error: null,
    loading: Boolean(studentId),
    record: null,
  })

  useEffect(() => {
    if (!studentId) {
      return undefined
    }

    const unsubscribe = onSnapshot(
      doc(db, 'students', studentId),
      (snapshot) => {
        setState({
          error: null,
          loading: false,
          record: snapshot.exists() ? toStudentProfile(snapshot.id, snapshot.data()) : null,
        })
      },
      (error) => {
        setState({ error: error.message, loading: false, record: null })
      },
    )

    return unsubscribe
  }, [studentId])

  return studentId ? state : { error: null, loading: false, record: null }
}
