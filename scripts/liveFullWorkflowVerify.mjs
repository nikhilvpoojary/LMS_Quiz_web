import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('='))
    .map((line) => {
      const [key, ...value] = line.split('=')
      return [key, value.join('=')]
    }),
)
const firebaseToolsConfig = JSON.parse(
  readFileSync(`${process.env.USERPROFILE}\\.config\\configstore\\firebase-tools.json`, 'utf8'),
)

const projectId = env.VITE_FIREBASE_PROJECT_ID
const accessToken = firebaseToolsConfig.tokens.access_token
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

const auth = getAuth(app)
const db = getFirestore(app)
const runId = `${Date.now()}${Math.floor(Math.random() * 100000)}`
const schoolEmail = `codex-school-flow-${runId}@example.com`
const adminEmail = `codex-admin-flow-${runId}@example.com`
const password = 'FlowPass123'
const schoolName = `Codex Flow School ${runId}`
const principalName = 'Codex Flow Principal'
const adminName = 'Codex Flow Admin'
const bootstrapCollections = [
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
]

const bootstrapDocumentId = (ownerId) => `__bootstrap__${ownerId}`
const print = (value) => console.log(JSON.stringify(value, null, 2))

const firestoreDocumentUrl = (collection, documentId) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${documentId}`

const fieldValue = (value) => {
  if (typeof value === 'string') {
    return { stringValue: value }
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value }
  }

  return { nullValue: null }
}

const restSetDocument = async (collection, documentId, data) => {
  const response = await fetch(firestoreDocumentUrl(collection, documentId), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, fieldValue(value)]),
      ),
    }),
  })

  if (!response.ok) {
    throw new Error(`REST set ${collection}/${documentId} failed: ${response.status} ${await response.text()}`)
  }
}

const restDeleteDocument = async (collection, documentId) => {
  const response = await fetch(firestoreDocumentUrl(collection, documentId), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok && response.status !== 404) {
    throw new Error(`REST delete ${collection}/${documentId} failed: ${response.status} ${await response.text()}`)
  }
}

const registrationPayload = (uid) => ({
  createdAt: serverTimestamp(),
  email: schoolEmail,
  principalName,
  registrationDate: serverTimestamp(),
  schoolId: uid,
  schoolName,
  status: 'pending',
  updatedAt: serverTimestamp(),
})

const addBootstrapWrites = (batch, uid) => {
  for (const collectionName of bootstrapCollections) {
    batch.set(doc(db, collectionName, bootstrapDocumentId(uid)), {
      collection: collectionName,
      createdAt: serverTimestamp(),
      kind: 'collectionBootstrap',
      ownerId: uid,
      status: 'ready',
      updatedAt: serverTimestamp(),
    })
  }
}

const registerSchoolBatch = async (schoolUid) => {
  const payload = registrationPayload(schoolUid)
  const batch = writeBatch(db)

  batch.set(doc(db, 'schools', schoolUid), payload)
  batch.set(doc(db, 'schoolRegistrations', schoolUid), payload)
  batch.set(doc(db, 'users', schoolUid), {
    email: schoolEmail,
    fullName: principalName,
    role: 'school',
    schoolId: schoolUid,
    status: 'pending',
  })
  addBootstrapWrites(batch, schoolUid)
  await batch.commit()
}

const generateSchoolCode = () => `COD-${String(runId).slice(-4)}`

const approveSchoolBatch = async (schoolUid, schoolCode) => {
  const batch = writeBatch(db)

  batch.update(doc(db, 'schools', schoolUid), {
    createdAt: serverTimestamp(),
    schoolCode,
    schoolId: `SCH-${schoolUid.slice(0, 8).toUpperCase()}`,
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'users', schoolUid), {
    schoolCode,
    schoolId: schoolUid,
    status: 'active',
  })
  batch.update(doc(db, 'schoolRegistrations', schoolUid), {
    schoolCode,
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'schoolCodes', schoolCode), {
    schoolCode,
    schoolId: schoolUid,
    schoolName,
    status: 'approved',
  })
  batch.set(doc(db, 'settings', schoolUid), {
    createdAt: serverTimestamp(),
    schoolId: schoolUid,
    schoolName,
    status: 'active',
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'analytics', schoolUid), {
    attendanceRecords: 0,
    classes: 0,
    courses: 0,
    createdAt: serverTimestamp(),
    lessons: 0,
    quizAttempts: 0,
    quizzes: 0,
    schoolId: schoolUid,
    schoolName,
    students: 0,
    teachers: 0,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

let schoolUid
let adminUid
let schoolCode

try {
  const schoolCredential = await createUserWithEmailAndPassword(auth, schoolEmail, password)
  schoolUid = schoolCredential.user.uid
  await updateProfile(schoolCredential.user, { displayName: principalName })
  print({ step: 'Create school Authentication user', uid: schoolUid, result: 'PASS' })

  await registerSchoolBatch(schoolUid)
  print({ step: 'Create pending school registration batch', writes: 18, result: 'PASS' })

  const adminCredential = await createUserWithEmailAndPassword(auth, adminEmail, password)
  adminUid = adminCredential.user.uid
  await updateProfile(adminCredential.user, { displayName: adminName })
  await restSetDocument('users', adminUid, {
    email: adminEmail,
    fullName: adminName,
    role: 'websiteAdmin',
    status: 'active',
  })
  print({ step: 'Create temporary website admin profile', uid: adminUid, result: 'PASS' })

  schoolCode = generateSchoolCode()
  await approveSchoolBatch(schoolUid, schoolCode)
  print({ step: 'Approve school and create school code', schoolCode, result: 'PASS' })

  for (const [collection, documentId] of [
    ['users', schoolUid],
    ['schools', schoolUid],
    ['schoolRegistrations', schoolUid],
    ['schoolCodes', schoolCode],
    ['settings', schoolUid],
    ['analytics', schoolUid],
  ]) {
    const snapshot = await getDoc(doc(db, collection, documentId))
    print({
      step: 'Verify document exists after approval',
      collection,
      documentId,
      exists: snapshot.exists(),
      result: snapshot.exists() ? 'PASS' : 'FAIL',
    })
  }

  await signInWithEmailAndPassword(auth, schoolEmail, password)
  const schoolSnapshot = await getDoc(doc(db, 'schools', schoolUid))
  print({
    step: 'School admin can read School Dashboard source document',
    collection: 'schools',
    documentId: schoolUid,
    exists: schoolSnapshot.exists(),
    result: schoolSnapshot.exists() ? 'PASS' : 'FAIL',
  })
} finally {
  for (const collectionName of bootstrapCollections) {
    if (schoolUid) {
      await restDeleteDocument(collectionName, bootstrapDocumentId(schoolUid))
    }
  }

  for (const [collection, documentId] of [
    ['users', schoolUid],
    ['schools', schoolUid],
    ['schoolRegistrations', schoolUid],
    ['schoolCodes', schoolCode],
    ['settings', schoolUid],
    ['analytics', schoolUid],
    ['users', adminUid],
  ]) {
    if (documentId) {
      await restDeleteDocument(collection, documentId)
    }
  }

  if (adminUid) {
    await signInWithEmailAndPassword(auth, adminEmail, password)
    await deleteUser(auth.currentUser)
    print({ step: 'Delete temporary admin Authentication user', uid: adminUid, result: 'PASS' })
  }

  if (schoolUid) {
    await signInWithEmailAndPassword(auth, schoolEmail, password)
    await deleteUser(auth.currentUser)
    print({ step: 'Delete temporary school Authentication user', uid: schoolUid, result: 'PASS' })
  }
}
