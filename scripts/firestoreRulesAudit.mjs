import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

const projectId = 'studyhub-rules-audit'
const uid = 'school_uid_123'
const email = 'principal@example.com'
const schoolName = 'Royal Public School'
const principalName = 'Nikhil Principal'
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

const rules = readFileSync('firestore.rules', 'utf8')

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules },
})

const authedDb = testEnv.authenticatedContext(uid, { email }).firestore()
const adminDb = testEnv.authenticatedContext('website_admin_uid', {
  email: 'admin@example.com',
}).firestore()

const timestamp = () => serverTimestamp()

const registrationPayload = () => ({
  createdAt: timestamp(),
  email,
  principalName,
  registrationDate: timestamp(),
  schoolId: uid,
  schoolName,
  status: 'pending',
  updatedAt: timestamp(),
})

const bootstrapDocumentId = (ownerId) => `__bootstrap__${ownerId}`

const bootstrapPayload = (collectionName) => ({
  collection: collectionName,
  createdAt: timestamp(),
  kind: 'collectionBootstrap',
  ownerId: uid,
  status: 'ready',
  updatedAt: timestamp(),
})

const schoolRegistrationOps = [
  {
    collection: 'schools',
    docId: uid,
    label: 'Create pending school document',
    rule: 'match /schools/{schoolId} allow create',
    data: registrationPayload,
  },
  {
    collection: 'schoolRegistrations',
    docId: uid,
    label: 'Create pending school registration document',
    rule: 'match /schoolRegistrations/{registrationId} allow create',
    data: registrationPayload,
  },
  {
    collection: 'users',
    docId: uid,
    label: 'Create pending school user profile',
    rule: 'match /users/{userId} allow create',
    data: () => ({
      email,
      fullName: principalName,
      role: 'school',
      schoolId: uid,
      status: 'pending',
    }),
  },
  ...bootstrapCollections.map((collectionName) => ({
    collection: collectionName,
    docId: bootstrapDocumentId(uid),
    label: `Bootstrap ${collectionName}`,
    rule: 'match /{collectionId}/{documentId} allow create via isBootstrapCreate',
    data: () => bootstrapPayload(collectionName),
  })),
]

const printOp = (index, op, result, error) => {
  const data = op.data()
  console.log(JSON.stringify({
    operation: index + 1,
    label: op.label,
    collection: op.collection,
    documentId: op.docId,
    data,
    rule: op.rule,
    result,
    reason: error?.message ?? 'Allowed by rules',
  }, null, 2))
}

const resetData = async () => {
  await testEnv.clearFirestore()
}

console.log('\nSCHOOL REGISTRATION WRITE AUDIT')
for (const [index, op] of schoolRegistrationOps.entries()) {
  await resetData()

  try {
    await assertSucceeds(setDoc(doc(authedDb, op.collection, op.docId), op.data()))
    printOp(index, op, 'PASS')
  } catch (error) {
    printOp(index, op, 'FAIL', error)
  }
}

await resetData()
const registrationBatch = writeBatch(authedDb)
for (const op of schoolRegistrationOps) {
  registrationBatch.set(doc(authedDb, op.collection, op.docId), op.data())
}

try {
  await assertSucceeds(registrationBatch.commit())
  console.log(JSON.stringify({
    registrationBatch: 'PASS',
    operations: schoolRegistrationOps.length,
  }, null, 2))
} catch (error) {
  console.log(JSON.stringify({
    registrationBatch: 'FAIL',
    operations: schoolRegistrationOps.length,
    reason: error.message,
  }, null, 2))
}

const schoolCode = 'ROY-1234'
const approvalOps = [
  {
    collection: 'schools',
    docId: uid,
    label: 'Approve school',
    rule: 'match /schools/{schoolId} allow update for super admin',
    apply: (batch) => batch.update(doc(adminDb, 'schools', uid), {
      createdAt: timestamp(),
      schoolCode,
      schoolId: `SCH-${uid.slice(0, 8).toUpperCase()}`,
      status: 'approved',
      updatedAt: timestamp(),
    }),
  },
  {
    collection: 'users',
    docId: uid,
    label: 'Activate school admin user',
    rule: 'match /users/{userId} allow update for super admin',
    apply: (batch) => batch.update(doc(adminDb, 'users', uid), {
      schoolCode,
      schoolId: uid,
      status: 'active',
    }),
  },
  {
    collection: 'schoolRegistrations',
    docId: uid,
    label: 'Approve registration audit document',
    rule: 'match /schoolRegistrations/{registrationId} allow update for super admin',
    apply: (batch) => batch.update(doc(adminDb, 'schoolRegistrations', uid), {
      schoolCode,
      status: 'approved',
      updatedAt: timestamp(),
    }),
  },
  {
    collection: 'schoolCodes',
    docId: schoolCode,
    label: 'Create public school code',
    rule: 'match /schoolCodes/{schoolCode} allow create for super admin',
    apply: (batch) => batch.set(doc(adminDb, 'schoolCodes', schoolCode), {
      schoolCode,
      schoolId: uid,
      schoolName,
      status: 'approved',
    }),
  },
  {
    collection: 'settings',
    docId: uid,
    label: 'Create school settings',
    rule: 'match /settings/{settingId} allow create',
    apply: (batch) => batch.set(doc(adminDb, 'settings', uid), {
      createdAt: timestamp(),
      schoolId: uid,
      schoolName,
      status: 'active',
      updatedAt: timestamp(),
    }),
  },
  {
    collection: 'analytics',
    docId: uid,
    label: 'Create school analytics',
    rule: 'match /analytics/{analyticsId} allow create for super admin',
    apply: (batch) => batch.set(doc(adminDb, 'analytics', uid), {
      attendanceRecords: 0,
      classes: 0,
      courses: 0,
      createdAt: timestamp(),
      lessons: 0,
      quizAttempts: 0,
      quizzes: 0,
      schoolId: uid,
      schoolName,
      students: 0,
      teachers: 0,
      updatedAt: timestamp(),
    }),
  },
]

await resetData()
await testEnv.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore()
  await setDoc(doc(db, 'users', 'website_admin_uid'), {
    email: 'admin@example.com',
    fullName: 'Admin',
    role: 'websiteAdmin',
    status: 'active',
  })
  await setDoc(doc(db, 'schools', uid), registrationPayload())
  await setDoc(doc(db, 'schoolRegistrations', uid), registrationPayload())
  await setDoc(doc(db, 'users', uid), {
    email,
    fullName: principalName,
    role: 'school',
    schoolId: uid,
    status: 'pending',
  })
})

console.log('\nADMIN APPROVAL BATCH AUDIT')
const approvalBatch = writeBatch(adminDb)
for (const op of approvalOps) {
  op.apply(approvalBatch)
  console.log(JSON.stringify({
    operation: op.label,
    collection: op.collection,
    documentId: op.docId,
    rule: op.rule,
  }, null, 2))
}

try {
  await assertSucceeds(approvalBatch.commit())
  console.log(JSON.stringify({
    approvalBatch: 'PASS',
    operations: approvalOps.length,
  }, null, 2))
} catch (error) {
  console.log(JSON.stringify({
    approvalBatch: 'FAIL',
    operations: approvalOps.length,
    reason: error.message,
  }, null, 2))
}

console.log('\nDOCUMENT EXISTENCE AFTER REGISTRATION')
await resetData()
const finalBatch = writeBatch(authedDb)
for (const op of schoolRegistrationOps) {
  finalBatch.set(doc(authedDb, op.collection, op.docId), op.data())
}
try {
  await finalBatch.commit()
  for (const path of [
    ['users', uid],
    ['schools', uid],
    ['schoolRegistrations', uid],
    ['schoolCodes', schoolCode],
  ]) {
    const snapshot = await getDoc(doc(authedDb, path[0], path[1]))
    console.log(JSON.stringify({
      collection: path[0],
      documentId: path[1],
      exists: snapshot.exists(),
      expectedAfterRegistration: path[0] === 'schoolCodes' ? false : true,
    }, null, 2))
  }
} catch (error) {
  console.log(JSON.stringify({
    documentExistenceCheck: 'SKIPPED',
    reason: error.message,
  }, null, 2))
}

await assertFails(setDoc(doc(testEnv.unauthenticatedContext().firestore(), 'schools', 'x'), registrationPayload()))
await testEnv.cleanup()
