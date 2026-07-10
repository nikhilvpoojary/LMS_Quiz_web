import { signOut } from 'firebase/auth'
import {
  doc,
  getDoc,
  onSnapshot,
  where,
  type QueryConstraint,
} from 'firebase/firestore'
import {
  BarChart3,
  BookOpen,
  Check,
  Clipboard,
  Copy,
  GraduationCap,
  LogOut,
  Pencil,
  Plus,
  Search,
  School,
  ToggleLeft,
  Trash2,
  UserCheck,
  UserRoundCheck,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { StatCard } from '../components/admin/StatCard'
import { EmptyState, ErrorState, SkeletonGrid } from '../components/common/StateViews'
import type { UserRole } from '../contexts/authContextValue'
import { auth, db } from '../firebase/firebase'
import {
  usePendingStudentRequests,
  useStudentProfile,
  useTeacherClasses,
  useTeacherClassMemberships,
  type ClassMembership,
} from '../hooks/useClassroomData'
import { useAuth } from '../hooks/useAuth'
import { useRealtimeCount } from '../hooks/useRealtimeCount'
import { useTeacherRequests } from '../hooks/useTeacherRequests'
import {
  approveStudentRequest,
  createTeacherClass,
  joinClass,
  rejectStudentRequest,
} from '../services/classroom'
import {
  approveTeacherRequest,
  rejectTeacherRequest,
} from '../services/registration'
import type { School as SchoolRecord } from '../types/school'

const dashboardTitles: Record<Exclude<UserRole, 'websiteAdmin'>, string> = {
  school: 'School Dashboard',
  teacher: 'Teacher Dashboard',
  student: 'Student Dashboard',
}

interface RoleDashboardPageProps {
  role: Exclude<UserRole, 'websiteAdmin'>
}

const formatTimestamp = (timestamp?: { toDate?: () => Date } | null) =>
  timestamp?.toDate?.().toLocaleDateString('en-IN', { dateStyle: 'medium' }) ??
  'Not available'

interface JoinedStudentRow {
  className: string
  email: string
  fullName: string
  joinedAt: ClassMembership['joinedAt']
  lastActivityAt: ClassMembership['lastActivityAt']
  membershipId: string
}

const classOptions = ['Class 8', 'Class 9', 'Class 10']

function TeacherDashboard() {
  const { user, userProfile } = useAuth()
  const [selectedClass, setSelectedClass] = useState(classOptions[0])
  const [createdClassId, setCreatedClassId] = useState('')
  const [schoolName, setSchoolName] = useState('School')
  const [creatingClass, setCreatingClass] = useState(false)
  const [studentRows, setStudentRows] = useState<JoinedStudentRow[]>([])
  const [studentRowsError, setStudentRowsError] = useState<string | null>(null)
  const teacherId = user?.uid
  const schoolId = userProfile?.schoolId
  const classes = useTeacherClasses(teacherId, schoolId)
  const pendingStudents = usePendingStudentRequests(schoolId)
  const memberships = useTeacherClassMemberships(teacherId, schoolId)
  const quizAttempts = useRealtimeCount(
    'quizAttempts',
    useMemo<QueryConstraint[]>(
      () => (schoolId && teacherId ? [where('schoolId', '==', schoolId), where('teacherId', '==', teacherId)] : []),
      [schoolId, teacherId],
    ),
  )
  const attendance = useRealtimeCount(
    'attendance',
    useMemo<QueryConstraint[]>(
      () => (schoolId && teacherId ? [where('schoolId', '==', schoolId), where('teacherId', '==', teacherId)] : []),
      [schoolId, teacherId],
    ),
  )

  useEffect(() => {
    if (!userProfile?.schoolCode) {
      return undefined
    }

    const unsubscribe = onSnapshot(doc(db, 'schoolCodes', userProfile.schoolCode), (snapshot) => {
      const data = snapshot.data()
      setSchoolName(String(data?.schoolName ?? 'School'))
    })

    return unsubscribe
  }, [userProfile?.schoolCode])

  useEffect(() => {
    let cancelled = false

    const loadStudents = async () => {
      if (memberships.records.length === 0) {
        setStudentRows([])
        setStudentRowsError(null)
        return
      }

      try {
        const rows = await Promise.all(
          memberships.records.map(async (membership) => {
            const studentSnapshot = await getDoc(doc(db, 'students', membership.studentId))
            const studentData = studentSnapshot.data()

            return {
              className: membership.className,
              email: String(studentData?.email ?? ''),
              fullName: String(studentData?.fullName ?? 'Student'),
              joinedAt: membership.joinedAt,
              lastActivityAt: membership.lastActivityAt,
              membershipId: membership.id,
            }
          }),
        )

        if (!cancelled) {
          setStudentRows(rows)
          setStudentRowsError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setStudentRows([])
          setStudentRowsError(error instanceof Error ? error.message : 'Unable to load students.')
        }
      }
    }

    void loadStudents()

    return () => {
      cancelled = true
    }
  }, [memberships.records])

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Signed out')
  }

  const handleCreateClass = async () => {
    if (!teacherId || !schoolId || !userProfile) {
      toast.error('Teacher profile is not ready.')
      return
    }

    setCreatingClass(true)

    try {
      const classId = await createTeacherClass({
        className: selectedClass,
        schoolId,
        schoolName,
        teacherId,
        teacherName: userProfile.fullName,
      })
      setCreatedClassId(classId)
      toast.success('Class created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create class.')
    } finally {
      setCreatingClass(false)
    }
  }

  const copyClassId = async (classId: string) => {
    await navigator.clipboard.writeText(classId)
    toast.success('Class ID copied')
  }

  const approveStudent = async (studentId: string) => {
    try {
      await approveStudentRequest(studentId)
      toast.success('Student approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to approve student.')
    }
  }

  const rejectStudent = async (studentId: string) => {
    try {
      await rejectStudentRequest(studentId)
      toast.success('Student rejected')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reject student.')
    }
  }

  const firstError =
    classes.error ??
    pendingStudents.error ??
    memberships.error ??
    studentRowsError ??
    quizAttempts.error ??
    attendance.error

  return (
    <main className="school-dashboard">
      <header className="school-dashboard-header">
        <div className="school-logo large">
          {userProfile?.fullName.charAt(0).toUpperCase() ?? 'T'}
        </div>
        <div className="school-dashboard-title">
          <p className="eyebrow">Teacher Dashboard</p>
          <h1>{userProfile?.fullName ?? 'Teacher'}</h1>
          <dl>
            <div>
              <dt>School</dt>
              <dd>{schoolName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{userProfile?.email}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="status-badge approved">Active</span>
              </dd>
            </div>
          </dl>
        </div>
        <button className="secondary-icon-button" type="button" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          Logout
        </button>
      </header>

      {firstError ? <ErrorState message={firstError} /> : null}

      <section className="stats-grid">
        <StatCard icon={School} label="Total Classes" loading={classes.loading} value={classes.records.length} />
        <StatCard icon={Users} label="Students Joined" loading={memberships.loading} value={memberships.records.length} />
        <StatCard icon={UserCheck} label="Pending Student Approvals" loading={pendingStudents.loading} value={pendingStudents.records.length} />
        <StatCard icon={BookOpen} label="Quiz Attempts" loading={quizAttempts.loading} value={quizAttempts.count} />
        <StatCard icon={BarChart3} label="Average Score" loading={false} value={0} />
        <StatCard icon={Check} label="Attendance" loading={attendance.loading} value={attendance.count} />
        <StatCard icon={GraduationCap} label="Active Students" loading={memberships.loading} value={new Set(memberships.records.map((membership) => membership.studentId)).size} />
      </section>

      <section className="dashboard-section">
        <div className="page-heading split-heading">
          <div>
            <p className="eyebrow">Classes</p>
            <h2>Create Class</h2>
          </div>
          <div className="teacher-tools">
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
              {classOptions.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
            <button className="primary-button icon-button" disabled={creatingClass} type="button" onClick={handleCreateClass}>
              <Plus aria-hidden="true" />
              {creatingClass ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </div>
        {createdClassId ? (
          <button className="inline-copy-button strong" type="button" onClick={() => copyClassId(createdClassId)}>
            <Copy aria-hidden="true" />
            {createdClassId}
          </button>
        ) : null}
        {classes.loading ? <SkeletonGrid items={2} /> : null}
        {!classes.loading && classes.records.length === 0 ? <EmptyState message="No classes created yet." /> : null}
        {classes.records.length > 0 ? (
          <section className="table-card">
            {classes.records.map((classRecord) => (
              <article className="table-row class-row" key={classRecord.classId}>
                <div>
                  <strong>{classRecord.className}</strong>
                  <span>{classRecord.classId}</span>
                </div>
                <span className="status-badge approved">{classRecord.status}</span>
                <time>{formatTimestamp(classRecord.createdAt)}</time>
                <button className="secondary-icon-button" type="button" onClick={() => copyClassId(classRecord.classId)}>
                  <Copy aria-hidden="true" />
                  Copy Class ID
                </button>
              </article>
            ))}
          </section>
        ) : null}
      </section>

      <section className="dashboard-section">
        <div className="page-heading">
          <p className="eyebrow">Approval Queue</p>
          <h2>Student Approval Requests</h2>
        </div>
        {pendingStudents.loading ? <SkeletonGrid items={2} /> : null}
        {!pendingStudents.loading && pendingStudents.records.length === 0 ? <EmptyState message="No pending student requests." /> : null}
        <div className="school-grid">
          {pendingStudents.records.map((request) => (
            <article className="school-card" key={request.id}>
              <div className="school-card-header">
                <div className="school-logo">{request.fullName.charAt(0).toUpperCase()}</div>
                <span className="status-badge pending">Pending</span>
              </div>
              <h3>{request.fullName}</h3>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{request.email}</dd>
                </div>
                <div>
                  <dt>Requested Date</dt>
                  <dd>{formatTimestamp(request.requestedDate)}</dd>
                </div>
              </dl>
              <div className="card-actions two-actions">
                <button type="button" onClick={() => approveStudent(request.id)}>
                  <Check aria-hidden="true" />
                  Approve
                </button>
                <button type="button" onClick={() => rejectStudent(request.id)}>
                  <X aria-hidden="true" />
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="page-heading">
          <p className="eyebrow">Classrooms</p>
          <h2>Joined Students</h2>
        </div>
        {memberships.loading ? <SkeletonGrid items={2} /> : null}
        {!memberships.loading && studentRows.length === 0 ? <EmptyState message="No students have joined your classes yet." /> : null}
        {studentRows.length > 0 ? (
          <section className="table-card">
            {studentRows.map((student) => (
              <article className="table-row student-row" key={student.membershipId}>
                <div>
                  <strong>{student.fullName}</strong>
                  <span>{student.email}</span>
                </div>
                <span>{student.className}</span>
                <time>{formatTimestamp(student.joinedAt)}</time>
                <time>{formatTimestamp(student.lastActivityAt)}</time>
              </article>
            ))}
          </section>
        ) : null}
      </section>
    </main>
  )
}

function StudentDashboard() {
  const { user, userProfile } = useAuth()
  const studentProfile = useStudentProfile(user?.uid)
  const [classId, setClassId] = useState('')
  const [joining, setJoining] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Signed out')
  }

  const handleJoinClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.uid || !userProfile?.schoolId) {
      toast.error('Student profile is not ready.')
      return
    }

    if (!classId.trim()) {
      toast.error('Enter a Class ID.')
      return
    }

    setJoining(true)

    try {
      await joinClass({
        classId,
        schoolId: userProfile.schoolId,
        studentId: user.uid,
      })
      setClassId('')
      setShowJoinForm(false)
      toast.success('Class joined')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join class.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <main className="role-dashboard">
      <section className="login-panel student-dashboard-panel">
        <div className="page-heading">
          <p className="eyebrow">Student Dashboard</p>
          <h1>{studentProfile.record?.fullName ?? userProfile?.fullName ?? 'Student'}</h1>
        </div>
        {studentProfile.error ? <ErrorState message={studentProfile.error} /> : null}
        <dl className="profile-list">
          <div>
            <dt>School</dt>
            <dd>{studentProfile.record?.schoolName ?? 'School'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{studentProfile.record?.email ?? userProfile?.email}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className="status-badge approved">{studentProfile.record?.status ?? 'active'}</span>
            </dd>
          </div>
        </dl>
        <div className="card-actions two-actions">
          <button type="button" onClick={() => setShowJoinForm((current) => !current)}>
            <Plus aria-hidden="true" />
            Join Class
          </button>
          <button type="button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Logout
          </button>
        </div>
        {showJoinForm ? (
          <form className="login-form join-class-form" onSubmit={handleJoinClass}>
            <label>
              Class ID
              <input
                autoCapitalize="characters"
                placeholder="CLS-..."
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
              />
            </label>
            <button className="primary-button" disabled={joining} type="submit">
              {joining ? 'Joining...' : 'Submit'}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  )
}

function SimpleDashboard({ role }: RoleDashboardPageProps) {
  const { userProfile } = useAuth()

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Signed out')
  }

  return (
    <main className="role-dashboard">
      <section className="login-panel">
        <div className="page-heading">
          <p className="eyebrow">StudyHub</p>
          <h1>{dashboardTitles[role]}</h1>
        </div>
        <p>Welcome, {userProfile?.fullName ?? userProfile?.email ?? 'user'}.</p>
        <button className="primary-button icon-button" type="button" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          Logout
        </button>
      </section>
    </main>
  )
}

export function RoleDashboardPage({ role }: RoleDashboardPageProps) {
  const { userProfile } = useAuth()
  const [school, setSchool] = useState<SchoolRecord | null>(null)
  const [schoolError, setSchoolError] = useState<string | null>(null)
  const [teacherSearch, setTeacherSearch] = useState('')
  const [teacherFilter, setTeacherFilter] = useState<'all' | 'active'>('all')
  const [teacherPage, setTeacherPage] = useState(1)
  const schoolId = userProfile?.schoolId

  const schoolConstraints = useMemo<QueryConstraint[]>(
    () => (schoolId ? [where('schoolId', '==', schoolId)] : []),
    [schoolId],
  )
  const teacherConstraints = useMemo<QueryConstraint[]>(
    () => (schoolId ? [where('schoolId', '==', schoolId)] : []),
    [schoolId],
  )
  const activeTeacherRequests = useTeacherRequests(schoolId, 'approved')
  const pendingTeacherRequests = useTeacherRequests(schoolId, 'pending')
  const classes = useRealtimeCount('classes', schoolConstraints)
  const courses = useRealtimeCount('courses', schoolConstraints)
  const students = useRealtimeCount('students', schoolConstraints)
  const teachers = useRealtimeCount('teachers', teacherConstraints)

  useEffect(() => {
    if (!schoolId || role !== 'school') {
      return undefined
    }

    const unsubscribe = onSnapshot(
      doc(db, 'schools', schoolId),
      (snapshot) => {
        const data = snapshot.data()

        if (!snapshot.exists() || !data) {
          setSchool(null)
          return
        }

        setSchool({
          email: String(data.email ?? ''),
          id: snapshot.id,
          logoUrl: typeof data.logoUrl === 'string' ? data.logoUrl : undefined,
          principalName: String(data.principalName ?? ''),
          schoolCode:
            typeof data.schoolCode === 'string' ? data.schoolCode : undefined,
          schoolId: typeof data.schoolId === 'string' ? data.schoolId : snapshot.id,
          schoolName: String(data.schoolName ?? 'School'),
          status: data.status === 'approved' ? 'approved' : 'pending',
          createdAt: data.createdAt,
          registrationDate: data.registrationDate,
          updatedAt: data.updatedAt,
        })
        setSchoolError(null)
      },
      (error) => {
        setSchoolError(error.message)
      },
    )

    return unsubscribe
  }, [role, schoolId])

  if (role === 'teacher') {
    return <TeacherDashboard />
  }

  if (role === 'student') {
    return <StudentDashboard />
  }

  if (role !== 'school') {
    return <SimpleDashboard role={role} />
  }

  const copySchoolCode = async () => {
    if (!school?.schoolCode) {
      return
    }

    await navigator.clipboard.writeText(school.schoolCode)
    toast.success('School Code Copied')
  }

  const approveTeacher = async (requestId: string) => {
    await approveTeacherRequest(requestId)
    toast.success('Teacher approved')
  }

  const rejectTeacher = async (requestId: string) => {
    await rejectTeacherRequest(requestId)
    toast.success('Teacher rejected')
  }

  const filteredTeachers = activeTeacherRequests.requests.filter((teacher) => {
    const normalizedSearch = teacherSearch.trim().toLowerCase()
    const matchesSearch = normalizedSearch
      ? `${teacher.fullName} ${teacher.email} ${teacher.subjects.join(' ')}`
          .toLowerCase()
          .includes(normalizedSearch)
      : true
    const matchesFilter = teacherFilter === 'all' || teacher.status === 'approved'

    return matchesSearch && matchesFilter
  })
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / pageSize))
  const currentPage = Math.min(teacherPage, pageCount)
  const pagedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const firstError =
    schoolError ??
    activeTeacherRequests.error ??
    pendingTeacherRequests.error ??
    classes.error ??
    courses.error ??
    students.error ??
    teachers.error

  return (
    <main className="school-dashboard">
      <header className="school-dashboard-header">
        <div className="school-logo large">
          {school?.logoUrl ? (
            <img alt={`${school.schoolName} logo`} src={school.logoUrl} />
          ) : (
            school?.schoolName.charAt(0).toUpperCase() ?? 'S'
          )}
        </div>
        <div className="school-dashboard-title">
          <p className="eyebrow">School Admin Dashboard</p>
          <h1>{school?.schoolName ?? 'School Dashboard'}</h1>
          <dl>
            <div>
              <dt>Principal</dt>
              <dd>{school?.principalName ?? userProfile?.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{school?.email ?? userProfile?.email}</dd>
            </div>
            <div>
              <dt>School Code</dt>
              <dd>
                <button
                  className="inline-copy-button strong"
                  type="button"
                  onClick={copySchoolCode}
                >
                  <Clipboard aria-hidden="true" />
                  {school?.schoolCode ?? 'Pending'}
                </button>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="status-badge approved">
                  {school?.status ?? 'approved'}
                </span>
              </dd>
            </div>
            <div>
              <dt>Created Date</dt>
              <dd>{formatTimestamp(school?.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <button className="secondary-icon-button" type="button" onClick={() => signOut(auth)}>
          <LogOut aria-hidden="true" />
          Logout
        </button>
      </header>

      {firstError ? <ErrorState message={firstError} /> : null}

      <section className="stats-grid">
        <StatCard
          icon={UserRoundCheck}
          label="Total Teachers"
          loading={teachers.loading}
          value={teachers.count}
        />
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          loading={students.loading}
          value={students.count}
        />
        <StatCard icon={School} label="Classes" loading={classes.loading} value={classes.count} />
        <StatCard
          icon={BookOpen}
          label="Courses"
          loading={courses.loading}
          value={courses.count}
        />
      </section>

      <section className="dashboard-section">
        <div className="page-heading split-heading">
          <div>
            <p className="eyebrow">Approval Queue</p>
            <h2>Teacher Approval Requests</h2>
          </div>
        </div>
        {pendingTeacherRequests.loading ? <SkeletonGrid items={2} /> : null}
        {!pendingTeacherRequests.loading && pendingTeacherRequests.requests.length === 0 ? (
          <EmptyState message="No pending teacher requests." />
        ) : null}
        <div className="school-grid">
          {pendingTeacherRequests.requests.map((request) => (
            <article className="school-card" key={request.id}>
              <div className="school-card-header">
                <div className="school-logo">{request.fullName.charAt(0).toUpperCase()}</div>
                <span className="status-badge pending">Pending</span>
              </div>
              <h3>{request.fullName}</h3>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{request.email}</dd>
                </div>
                <div>
                  <dt>Requested Date</dt>
                  <dd>{formatTimestamp(request.requestedDate)}</dd>
                </div>
              </dl>
              <div className="card-actions two-actions">
                <button type="button" onClick={() => approveTeacher(request.id)}>
                  <Check aria-hidden="true" />
                  Approve
                </button>
                <button type="button" onClick={() => rejectTeacher(request.id)}>
                  <X aria-hidden="true" />
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="page-heading split-heading">
          <div>
            <p className="eyebrow">Directory</p>
            <h2>Manage Teachers</h2>
          </div>
          <div className="teacher-tools">
            <label className="search-box">
              <Search aria-hidden="true" />
              <input
                placeholder="Search teachers"
                type="search"
                value={teacherSearch}
                onChange={(event) => {
                  setTeacherSearch(event.target.value)
                  setTeacherPage(1)
                }}
              />
            </label>
            <select
              value={teacherFilter}
              onChange={(event) => setTeacherFilter(event.target.value as 'all' | 'active')}
            >
              <option value="all">All teachers</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {activeTeacherRequests.loading ? <SkeletonGrid items={2} /> : null}
        {!activeTeacherRequests.loading && pagedTeachers.length === 0 ? (
          <EmptyState message="No teachers found." />
        ) : null}
        {pagedTeachers.length > 0 ? (
          <section className="table-card">
            {pagedTeachers.map((teacher) => (
              <article className="table-row teachers-row" key={teacher.id}>
                <div>
                  <strong>{teacher.fullName}</strong>
                  <span>{teacher.email}</span>
                </div>
                <span>{teacher.subjects.length ? teacher.subjects.join(', ') : 'No subjects'}</span>
                <span className="status-badge approved">Active</span>
                <time>{formatTimestamp(teacher.joinedDate)}</time>
                <div className="row-actions">
                  <button aria-label="Edit teacher" type="button">
                    <Pencil aria-hidden="true" />
                  </button>
                  <button aria-label="Disable teacher" type="button">
                    <ToggleLeft aria-hidden="true" />
                  </button>
                  <button aria-label="Delete teacher" type="button">
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : null}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            type="button"
            onClick={() => setTeacherPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <button
            disabled={currentPage === pageCount}
            type="button"
            onClick={() => setTeacherPage((page) => Math.min(pageCount, page + 1))}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  )
}
