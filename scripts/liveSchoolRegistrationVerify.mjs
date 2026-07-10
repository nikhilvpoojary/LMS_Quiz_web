import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
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

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

const auth = getAuth(app)
const db = getFirestore(app)
const runId = `${Date.now()}${Math.floor(Math.random() * 100000)}`
const email = `codex-verify-${runId}@example.com`
const password = 'VerifyPass123'
const schoolName = `Codex Verify School ${runId}`
const principalName = 'Codex Verify Principal'
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

const registrationPayload = (uid) => ({
  createdAt: serverTimestamp(),
  email,
  principalName,
  registrationDate: serverTimestamp(),
  schoolId: uid,
  schoolName,
  status: 'pending',
  updatedAt: serverTimestamp(),
})

const addRegistrationWrites = (batch, uid) => {
  const payload = registrationPayload(uid)

  batch.set(doc(db, 'schools', uid), payload)
  batch.set(doc(db, 'schoolRegistrations', uid), payload)
  batch.set(doc(db, 'users', uid), {
    email,
    fullName: principalName,
    role: 'school',
    schoolId: uid,
    status: 'pending',
  })

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

const addRollbackWrites = (batch, uid) => {
  batch.delete(doc(db, 'schools', uid))
  batch.delete(doc(db, 'schoolRegistrations', uid))
  batch.delete(doc(db, 'users', uid))

  for (const collectionName of bootstrapCollections) {
    batch.delete(doc(db, collectionName, bootstrapDocumentId(uid)))
  }
}

let credential

try {
  credential = await createUserWithEmailAndPassword(auth, email, password)
  const uid = credential.user.uid

  print({
    operation: 1,
    type: 'Firebase Authentication',
    action: 'createUserWithEmailAndPassword',
    uid,
    email,
    result: 'PASS',
  })

  await updateProfile(credential.user, { displayName: principalName })
  print({
    operation: 2,
    type: 'Firebase Authentication',
    action: 'updateProfile',
    uid,
    result: 'PASS',
  })

  const batch = writeBatch(db)
  addRegistrationWrites(batch, uid)
  await batch.commit()
  print({
    operation: 3,
    type: 'Firestore writeBatch',
    action: 'school registration batch',
    writes: 18,
    result: 'PASS',
  })

  for (const [collection, documentId] of [
    ['users', uid],
    ['schools', uid],
    ['schoolRegistrations', uid],
  ]) {
    const snapshot = await getDoc(doc(db, collection, documentId))
    print({
      type: 'Firestore verification read',
      collection,
      documentId,
      exists: snapshot.exists(),
      result: snapshot.exists() ? 'PASS' : 'FAIL',
    })
  }

  const rollbackBatch = writeBatch(db)
  addRollbackWrites(rollbackBatch, uid)
  await rollbackBatch.commit()
  print({
    operation: 4,
    type: 'Firestore writeBatch',
    action: 'rollback verification documents',
    result: 'PASS',
  })
} finally {
  if (credential?.user) {
    await deleteUser(credential.user)
    print({
      operation: 5,
      type: 'Firebase Authentication',
      action: 'deleteUser',
      uid: credential.user.uid,
      result: 'PASS',
    })
  }
}
