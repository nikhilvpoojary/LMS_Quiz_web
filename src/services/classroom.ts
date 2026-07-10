import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

const classIdPrefix = 'CLS'
const classIdRandomPart = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase()

export interface CreateClassValues {
  className: string
  schoolId: string
  schoolName: string
  teacherId: string
  teacherName: string
}

export const generateClassId = () =>
  `${classIdPrefix}-${Date.now().toString(36).toUpperCase()}-${classIdRandomPart()}`

export const createTeacherClass = async (values: CreateClassValues) => {
  const classId = generateClassId()

  await setDoc(doc(db, 'classes', classId), {
    classId,
    className: values.className,
    createdAt: serverTimestamp(),
    schoolId: values.schoolId,
    schoolName: values.schoolName,
    status: 'active',
    teacherId: values.teacherId,
    teacherName: values.teacherName,
  })

  return classId
}

export const approveStudentRequest = async (requestId: string) => {
  const requestRef = doc(db, 'studentRequests', requestId)
  const requestSnapshot = await getDoc(requestRef)

  if (!requestSnapshot.exists()) {
    throw new Error('Student request was not found.')
  }

  const data = requestSnapshot.data()
  const joinedDate = serverTimestamp()
  const batch = writeBatch(db)

  batch.update(requestRef, {
    joinedDate,
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'students', requestId), {
    email: String(data.email ?? ''),
    fullName: String(data.fullName ?? ''),
    joinedDate,
    schoolCode: String(data.schoolCode ?? ''),
    schoolId: String(data.schoolId ?? ''),
    schoolName: String(data.schoolName ?? ''),
    status: 'active',
    studentId: requestId,
  })
  batch.update(doc(db, 'users', requestId), {
    status: 'active',
  })

  await batch.commit()
}

export const rejectStudentRequest = async (requestId: string) => {
  const batch = writeBatch(db)

  batch.update(doc(db, 'studentRequests', requestId), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'users', requestId), {
    status: 'rejected',
  })

  await batch.commit()
}

export interface JoinClassValues {
  classId: string
  schoolId: string
  studentId: string
}

export const joinClass = async ({ classId, schoolId, studentId }: JoinClassValues) => {
  const normalizedClassId = classId.trim().toUpperCase()
  const classSnapshot = await getDoc(doc(db, 'classes', normalizedClassId))

  if (!classSnapshot.exists()) {
    throw new Error('Class ID was not found.')
  }

  const classData = classSnapshot.data()

  if (classData.schoolId !== schoolId) {
    throw new Error('This class does not belong to your school.')
  }

  if (classData.status !== 'active') {
    throw new Error('This class is not active.')
  }

  const membershipId = `${normalizedClassId}_${studentId}`

  await setDoc(doc(db, 'classMemberships', membershipId), {
    classId: normalizedClassId,
    className: String(classData.className ?? ''),
    joinedAt: serverTimestamp(),
    lastActivityAt: null,
    schoolId,
    studentId,
    teacherId: String(classData.teacherId ?? ''),
  })
}
