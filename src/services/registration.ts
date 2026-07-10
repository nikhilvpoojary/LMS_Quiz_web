import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  updateProfile,
  type UserCredential,
} from 'firebase/auth'
import { auth, db } from '../firebase/firebase'
import {
  addApprovedSchoolWorkspaceToBatch,
  addBootstrapDocumentsToBatch,
} from './firestoreSetup'

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export const isSecurePassword = (password: string) => passwordPattern.test(password)

export const passwordHelp =
  'Password must be at least 8 characters and include a letter and a number.'

const normalizeCode = (code: string) => code.trim().toUpperCase()

export const getSchoolCodePrefix = (schoolName: string) => {
  const words = schoolName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length >= 3) {
    return words
      .slice(0, 3)
      .map((word) => word[0])
      .join('')
  }

  return (words[0] ?? 'STUDY').slice(0, 6)
}

const randomFourDigits = () => String(Math.floor(1000 + Math.random() * 9000))

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const assertEmailAvailable = async (email: string) => {
  const signInMethods = await fetchSignInMethodsForEmail(auth, normalizeEmail(email))

  if (signInMethods.length > 0) {
    throw new Error('This email is already registered.')
  }
}

const rollbackSchoolRegistrationDocuments = async (userId: string) => {
  const rollbackBatch = writeBatch(db)

  rollbackBatch.delete(doc(db, 'schools', userId))
  rollbackBatch.delete(doc(db, 'schoolRegistrations', userId))
  rollbackBatch.delete(doc(db, 'users', userId))

  addBootstrapDocumentsToBatch(rollbackBatch, userId, 'delete')
  await rollbackBatch.commit()
}

const rollbackTeacherRegistrationDocuments = async (userId: string) => {
  const rollbackBatch = writeBatch(db)

  rollbackBatch.delete(doc(db, 'teacherRequests', userId))
  rollbackBatch.delete(doc(db, 'teachers', userId))
  rollbackBatch.delete(doc(db, 'users', userId))
  await rollbackBatch.commit()
}

const rollbackStudentRegistrationDocuments = async (userId: string) => {
  const rollbackBatch = writeBatch(db)

  rollbackBatch.delete(doc(db, 'studentRequests', userId))
  rollbackBatch.delete(doc(db, 'students', userId))
  rollbackBatch.delete(doc(db, 'users', userId))
  await rollbackBatch.commit()
}

export const generateUniqueSchoolCode = async (schoolName: string) => {
  const prefix = getSchoolCodePrefix(schoolName)

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const candidate = `${prefix}-${randomFourDigits()}`
    const existing = await getDoc(doc(db, 'schoolCodes', candidate))

    if (!existing.exists()) {
      return candidate
    }
  }

  return `${prefix}-${Date.now().toString().slice(-4)}`
}

export interface SchoolRegistrationValues {
  schoolName: string
  principalName: string
  email: string
  password: string
}

export const registerSchool = async (values: SchoolRegistrationValues) => {
  let credential: UserCredential | null = null

  await assertEmailAvailable(values.email)

  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      normalizeEmail(values.email),
      values.password,
    )
    const userId = credential.user.uid

    await updateProfile(credential.user, { displayName: values.principalName })

    const schoolRef = doc(db, 'schools', userId)
    const schoolRegistrationRef = doc(db, 'schoolRegistrations', userId)
    const userRef = doc(db, 'users', userId)
    const registrationPayload = {
      createdAt: serverTimestamp(),
      email: normalizeEmail(values.email),
      principalName: values.principalName.trim(),
      registrationDate: serverTimestamp(),
      schoolId: userId,
      schoolName: values.schoolName.trim(),
      status: 'pending',
      updatedAt: serverTimestamp(),
    }

    const batch = writeBatch(db)
    batch.set(schoolRef, registrationPayload)
    batch.set(schoolRegistrationRef, registrationPayload)
    batch.set(userRef, {
      email: normalizeEmail(values.email),
      fullName: values.principalName.trim(),
      role: 'school',
      schoolId: userId,
      status: 'pending',
    })
    addBootstrapDocumentsToBatch(batch, userId)
    await batch.commit()

    return userId
  } catch (error) {
    if (credential) {
      try {
        await rollbackSchoolRegistrationDocuments(credential.user.uid)
      } catch {
        // The registration write is batched, so partial Firestore writes are not
        // expected. Cleanup is best-effort for ambiguous network failures.
      }

      await deleteUser(credential.user)
    }

    throw error
  }
}

export interface TeacherRegistrationValues {
  fullName: string
  email: string
  password: string
  schoolCode: string
}

export const findApprovedSchoolByCode = async (schoolCode: string) => {
  const codeSnapshot = await getDoc(doc(db, 'schoolCodes', normalizeCode(schoolCode)))

  if (!codeSnapshot.exists() || codeSnapshot.data().status !== 'approved') {
    return null
  }

  return {
    id: String(codeSnapshot.data().schoolId ?? ''),
    schoolName: String(codeSnapshot.data().schoolName ?? 'School'),
  }
}

export const registerTeacher = async (values: TeacherRegistrationValues) => {
  const school = await findApprovedSchoolByCode(values.schoolCode)

  if (!school) {
    throw new Error('Enter a valid approved school code.')
  }

  let credential: UserCredential | null = null

  await assertEmailAvailable(values.email)

  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      normalizeEmail(values.email),
      values.password,
    )
    const userId = credential.user.uid

    await updateProfile(credential.user, { displayName: values.fullName })

    const requestPayload = {
      email: normalizeEmail(values.email),
      fullName: values.fullName.trim(),
      requestedDate: serverTimestamp(),
      schoolCode: normalizeCode(values.schoolCode),
      schoolId: school.id,
      schoolName: school.schoolName,
      status: 'pending',
      subjects: [],
      teacherId: userId,
    }

    const batch = writeBatch(db)
    batch.set(doc(db, 'teacherRequests', userId), requestPayload)
    batch.set(doc(db, 'users', userId), {
      email: normalizeEmail(values.email),
      fullName: values.fullName.trim(),
      role: 'teacher',
      schoolCode: normalizeCode(values.schoolCode),
      schoolId: school.id,
      status: 'pending',
    })
    await batch.commit()

    return userId
  } catch (error) {
    if (credential) {
      try {
        await rollbackTeacherRegistrationDocuments(credential.user.uid)
      } catch {
        // Batched registration writes are atomic, but cleanup is best-effort
        // when the client cannot know whether a network-interrupted commit landed.
      }

      await deleteUser(credential.user)
    }

    throw error
  }
}

export interface StudentRegistrationValues {
  fullName: string
  email: string
  password: string
  schoolCode: string
}

export const registerStudent = async (values: StudentRegistrationValues) => {
  const school = await findApprovedSchoolByCode(values.schoolCode)

  if (!school) {
    throw new Error('Enter a valid approved school code.')
  }

  let credential: UserCredential | null = null

  await assertEmailAvailable(values.email)

  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      normalizeEmail(values.email),
      values.password,
    )
    const userId = credential.user.uid

    await updateProfile(credential.user, { displayName: values.fullName })

    const studentPayload = {
      email: normalizeEmail(values.email),
      fullName: values.fullName.trim(),
      requestedDate: serverTimestamp(),
      schoolCode: normalizeCode(values.schoolCode),
      schoolId: school.id,
      schoolName: school.schoolName,
      status: 'pending',
      studentId: userId,
    }

    const batch = writeBatch(db)
    batch.set(doc(db, 'studentRequests', userId), studentPayload)
    batch.set(doc(db, 'users', userId), {
      email: normalizeEmail(values.email),
      fullName: values.fullName.trim(),
      role: 'student',
      schoolCode: normalizeCode(values.schoolCode),
      schoolId: school.id,
      status: 'pending',
    })
    await batch.commit()

    return userId
  } catch (error) {
    if (credential) {
      try {
        await rollbackStudentRegistrationDocuments(credential.user.uid)
      } catch {
        // See teacher cleanup note above.
      }

      await deleteUser(credential.user)
    }

    throw error
  }
}

export const approveSchool = async (schoolId: string, schoolName: string) => {
  const schoolCode = await generateUniqueSchoolCode(schoolName)
  const publicSchoolId = `SCH-${schoolId.slice(0, 8).toUpperCase()}`

  const batch = writeBatch(db)
  batch.update(doc(db, 'schools', schoolId), {
    createdAt: serverTimestamp(),
    schoolCode,
    schoolId: publicSchoolId,
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'users', schoolId), {
    schoolCode,
    schoolId,
    status: 'active',
  })
  batch.update(doc(db, 'schoolRegistrations', schoolId), {
    schoolCode,
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'schoolCodes', schoolCode), {
    schoolCode,
    schoolId,
    schoolName,
    status: 'approved',
  })
  addApprovedSchoolWorkspaceToBatch(batch, schoolId, schoolName)
  await batch.commit()

  return schoolCode
}

export const approveTeacherRequest = async (requestId: string) => {
  const requestSnapshot = await getDoc(doc(db, 'teacherRequests', requestId))
  const requestData = requestSnapshot.data()
  const requestRef = doc(db, 'teacherRequests', requestId)
  const teacherRef = doc(db, 'teachers', requestId)
  const userRef = doc(db, 'users', requestId)
  const joinedDate = serverTimestamp()

  const batch = writeBatch(db)
  batch.update(requestRef, {
    joinedDate,
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
  batch.set(
    teacherRef,
    {
      email: String(requestData?.email ?? ''),
      fullName: String(requestData?.fullName ?? ''),
      joinedDate,
      schoolId: String(requestData?.schoolId ?? ''),
      schoolName: String(requestData?.schoolName ?? ''),
      status: 'active',
      subjects: Array.isArray(requestData?.subjects) ? requestData.subjects : [],
      teacherId: requestId,
    },
    { merge: true },
  )
  batch.update(userRef, {
    status: 'active',
  })
  await batch.commit()
}

export const rejectTeacherRequest = async (requestId: string) => {
  const batch = writeBatch(db)
  batch.update(doc(db, 'teacherRequests', requestId), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'users', requestId), {
    status: 'rejected',
  })
  await batch.commit()
}

export const rejectSchool = async (schoolId: string, reason = '') => {
  const batch = writeBatch(db)

  batch.update(doc(db, 'schools', schoolId), {
    rejectionReason: reason,
    status: 'rejected',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'schoolRegistrations', schoolId), {
    rejectionReason: reason,
    status: 'rejected',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'users', schoolId), {
    status: 'rejected',
  })
  await batch.commit()
}
