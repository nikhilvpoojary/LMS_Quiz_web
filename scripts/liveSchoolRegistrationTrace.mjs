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
  setDoc,
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
const email = `codex-school-${runId}@example.com`
const password = 'TracePass123'
const schoolName = `Codex Trace School ${runId}`
const principalName = 'Codex Trace Principal'

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

const bootstrapPayload = (uid, collectionName) => ({
  collection: collectionName,
  createdAt: serverTimestamp(),
  kind: 'collectionBootstrap',
  ownerId: uid,
  status: 'ready',
  updatedAt: serverTimestamp(),
})

const print = (value) => console.log(JSON.stringify(value, null, 2))

let credential

try {
  print({
    operation: 1,
    type: 'Firebase Authentication',
    action: 'createUserWithEmailAndPassword',
    email,
  })
  credential = await createUserWithEmailAndPassword(auth, email, password)
  const uid = credential.user.uid

  print({
    operation: 2,
    type: 'Firebase Authentication',
    action: 'updateProfile',
    uid,
    displayName: principalName,
  })
  await updateProfile(credential.user, { displayName: principalName })

  const operations = [
    {
      collection: 'schools',
      docId: uid,
      data: () => registrationPayload(uid),
      rule: 'match /schools/{schoolId} allow create',
    },
    {
      collection: 'schoolRegistrations',
      docId: uid,
      data: () => registrationPayload(uid),
      rule: 'match /schoolRegistrations/{registrationId} allow create',
    },
    {
      collection: 'users',
      docId: uid,
      data: () => ({
        email,
        fullName: principalName,
        role: 'school',
        schoolId: uid,
        status: 'pending',
      }),
      rule: 'match /users/{userId} allow create',
    },
    ...bootstrapCollections.map((collectionName) => ({
      collection: collectionName,
      docId: bootstrapDocumentId(uid),
      data: () => bootstrapPayload(uid, collectionName),
      rule: 'match /{collectionId}/{documentId} allow create via isBootstrapCreate',
    })),
  ]

  let deniedOperation = null

  for (const [index, operation] of operations.entries()) {
    const operationNumber = index + 3
    const data = operation.data()

    print({
      operation: operationNumber,
      type: 'Firestore write',
      action: 'setDoc',
      collection: operation.collection,
      documentId: operation.docId,
      data,
      rule: operation.rule,
    })

    try {
      await setDoc(doc(db, operation.collection, operation.docId), data)
      print({
        operation: operationNumber,
        result: 'PASS',
      })
    } catch (error) {
      deniedOperation = {
        operation: operationNumber,
        collection: operation.collection,
        documentId: operation.docId,
        data,
        rule: operation.rule,
        result: 'FAIL',
        error: error.message,
      }
      print(deniedOperation)
      break
    }
  }

  if (!deniedOperation) {
    const batchUser = `${uid}_batch`
    const batch = writeBatch(db)
    for (const operation of operations) {
      const docId = operation.docId === uid ? batchUser : operation.docId.replace(uid, batchUser)
      const data = operation.collection === 'schools' || operation.collection === 'schoolRegistrations'
        ? registrationPayload(batchUser)
        : operation.collection === 'users'
          ? {
              email,
              fullName: principalName,
              role: 'school',
              schoolId: batchUser,
              status: 'pending',
            }
          : bootstrapPayload(batchUser, operation.collection)
      batch.set(doc(db, operation.collection, docId), data)
    }
    try {
      await batch.commit()
      print({ batchCommit: 'PASS' })
    } catch (error) {
      print({ batchCommit: 'FAIL', error: error.message })
    }
  }

  for (const [collection, docId] of [
    ['users', uid],
    ['schools', uid],
    ['schoolRegistrations', uid],
  ]) {
    try {
      const snapshot = await getDoc(doc(db, collection, docId))
      print({
        collection,
        documentId: docId,
        existsAfterTrace: snapshot.exists(),
      })
    } catch (error) {
      print({
        collection,
        documentId: docId,
        existsAfterTrace: 'unreadable',
        error: error.message,
      })
    }
  }
} finally {
  if (credential?.user) {
    try {
      await deleteUser(credential.user)
      print({
        type: 'Firebase Authentication',
        action: 'deleteUser',
        uid: credential.user.uid,
        result: 'PASS',
      })
    } catch (error) {
      print({
        type: 'Firebase Authentication',
        action: 'deleteUser',
        uid: credential.user.uid,
        result: 'FAIL',
        error: error.message,
      })
    }
  }
}
