import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { db } from '../firebase/firebase'
import type { ClassMembership } from './useClassroomData'

export interface QuizAttemptRecord {
  id: string
  answers: unknown[]
  attemptNumber: number
  classId: string
  className: string
  correct: number
  courseId: string
  duration: number
  percentage: number
  schoolId: string
  score: number
  startedAt?: { toDate?: () => Date; toMillis?: () => number }
  studentId: string
  studentName: string
  subject: string
  submittedAt?: { toDate?: () => Date; toMillis?: () => number }
  teacherId: string
  testId: string
  testTitle: string
  totalQuestions: number
  wrong: number
}

interface RealtimeListState<T> {
  error: string | null
  loading: boolean
  records: T[]
}

const timestampMillis = (value?: { toMillis?: () => number }) => value?.toMillis?.() ?? 0

const toMembership = (id: string, data: DocumentData): ClassMembership => ({
  id,
  classId: String(data.classId ?? ''),
  className: String(data.className ?? ''),
  joinedAt: data.joinedAt,
  lastActivityAt: data.lastActivityAt ?? null,
  schoolId: String(data.schoolId ?? ''),
  studentEmail: typeof data.studentEmail === 'string' ? data.studentEmail : undefined,
  studentId: String(data.studentId ?? ''),
  studentName: typeof data.studentName === 'string' ? data.studentName : undefined,
  teacherId: String(data.teacherId ?? ''),
  teacherName: typeof data.teacherName === 'string' ? data.teacherName : undefined,
})

const toAttempt = (id: string, data: DocumentData): QuizAttemptRecord => ({
  id,
  answers: Array.isArray(data.answers) ? data.answers : [],
  attemptNumber: Number(data.attemptNumber ?? 1),
  classId: String(data.classId ?? ''),
  className: String(data.className ?? ''),
  correct: Number(data.correct ?? 0),
  courseId: String(data.courseId ?? ''),
  duration: Number(data.duration ?? 0),
  percentage: Number(data.percentage ?? 0),
  schoolId: String(data.schoolId ?? ''),
  score: Number(data.score ?? 0),
  startedAt: data.startedAt,
  studentId: String(data.studentId ?? ''),
  studentName: String(data.studentName ?? 'Student'),
  subject: String(data.subject ?? ''),
  submittedAt: data.submittedAt,
  teacherId: String(data.teacherId ?? ''),
  testId: String(data.testId ?? ''),
  testTitle: String(data.testTitle ?? ''),
  totalQuestions: Number(data.totalQuestions ?? 10),
  wrong: Number(data.wrong ?? 0),
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

export function useStudentClassMemberships(studentId?: string, schoolId?: string) {
  const constraints = useMemo<QueryConstraint[]>(
    () => (studentId && schoolId ? [where('studentId', '==', studentId), where('schoolId', '==', schoolId)] : []),
    [schoolId, studentId],
  )
  const mapMembership = useCallback((id: string, data: DocumentData) => toMembership(id, data), [])
  const sortMembership = useCallback(
    (first: ClassMembership, second: ClassMembership) =>
      timestampMillis(second.joinedAt) - timestampMillis(first.joinedAt),
    [],
  )

  return useRealtimeList(
    'classMemberships',
    constraints,
    Boolean(studentId && schoolId),
    mapMembership,
    sortMembership,
  )
}

export function useStudentQuizAttempts(studentId?: string, schoolId?: string) {
  const constraints = useMemo<QueryConstraint[]>(
    () => (studentId && schoolId ? [where('studentId', '==', studentId), where('schoolId', '==', schoolId)] : []),
    [schoolId, studentId],
  )
  const mapAttempt = useCallback((id: string, data: DocumentData) => toAttempt(id, data), [])
  const sortAttempt = useCallback(
    (first: QuizAttemptRecord, second: QuizAttemptRecord) =>
      timestampMillis(second.submittedAt) - timestampMillis(first.submittedAt),
    [],
  )

  return useRealtimeList(
    'quizAttempts',
    constraints,
    Boolean(studentId && schoolId),
    mapAttempt,
    sortAttempt,
  )
}

export function useTeacherQuizAttempts(teacherId?: string, schoolId?: string) {
  const constraints = useMemo<QueryConstraint[]>(
    () => (teacherId && schoolId ? [where('teacherId', '==', teacherId), where('schoolId', '==', schoolId)] : []),
    [schoolId, teacherId],
  )
  const mapAttempt = useCallback((id: string, data: DocumentData) => toAttempt(id, data), [])
  const sortAttempt = useCallback(
    (first: QuizAttemptRecord, second: QuizAttemptRecord) =>
      timestampMillis(second.submittedAt) - timestampMillis(first.submittedAt),
    [],
  )

  return useRealtimeList(
    'quizAttempts',
    constraints,
    Boolean(teacherId && schoolId),
    mapAttempt,
    sortAttempt,
  )
}
