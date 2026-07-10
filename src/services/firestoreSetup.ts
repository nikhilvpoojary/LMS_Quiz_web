import { doc, serverTimestamp, type WriteBatch } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export const BOOTSTRAP_KIND = 'collectionBootstrap'

export const REQUIRED_BOOTSTRAP_COLLECTIONS = [
  'schoolCodes',
  'teacherRequests',
  'studentRequests',
  'teachers',
  'students',
  'classes',
  'courses',
  'lessons',
  'quizzes',
  'quizAttempts',
  'attendance',
  'announcements',
  'notifications',
  'settings',
  'analytics',
] as const

export const bootstrapDocumentId = (ownerId: string) => `__bootstrap__${ownerId}`

export const addBootstrapDocumentsToBatch = (
  batch: WriteBatch,
  ownerId: string,
  mode: 'set' | 'delete' = 'set',
) => {
  REQUIRED_BOOTSTRAP_COLLECTIONS.forEach((collectionName) => {
    const bootstrapRef = doc(db, collectionName, bootstrapDocumentId(ownerId))

    if (mode === 'delete') {
      batch.delete(bootstrapRef)
      return
    }

    batch.set(bootstrapRef, {
      collection: collectionName,
      createdAt: serverTimestamp(),
      kind: BOOTSTRAP_KIND,
      ownerId,
      status: 'ready',
      updatedAt: serverTimestamp(),
    })
  })
}

export const addApprovedSchoolWorkspaceToBatch = (
  batch: WriteBatch,
  schoolId: string,
  schoolName: string,
) => {
  batch.set(doc(db, 'settings', schoolId), {
    createdAt: serverTimestamp(),
    schoolId,
    schoolName,
    status: 'active',
    updatedAt: serverTimestamp(),
  })

  batch.set(doc(db, 'analytics', schoolId), {
    attendanceRecords: 0,
    classes: 0,
    courses: 0,
    createdAt: serverTimestamp(),
    lessons: 0,
    quizAttempts: 0,
    quizzes: 0,
    schoolId,
    schoolName,
    students: 0,
    teachers: 0,
    updatedAt: serverTimestamp(),
  })
}
