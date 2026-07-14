import { signOut } from 'firebase/auth'
import {
  doc,
  onSnapshot,
  where,
  type QueryConstraint,
} from 'firebase/firestore'
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Clipboard,
  ClipboardList,
  Copy,
  ChartColumn,
  FileText,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  PlayCircle,
  School,
  Target,
  ToggleLeft,
  User,
  UserCheck,
  UserRoundCheck,
  Users,
  X,
  FlaskRound,
  Calculator,
  ArrowRight,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { ErrorState, SkeletonGrid } from '../components/common/StateViews'
import type { UserRole } from '../contexts/authContextValue'
import '../styles/StudentDashboard.css'
import '../styles/TeacherDashboard.css'
import '../styles/SchoolDashboard.css'
import { auth, db } from '../firebase/firebase'
import {
  usePendingStudentRequests,
  useStudentProfile,
  useTeacherClasses,
  useTeacherClassMemberships,
  type ClassMembership,
} from '../hooks/useClassroomData'
import { useAuth } from '../hooks/useAuth'
import {
  useStudentClassMemberships,
  useStudentQuizAttempts,
  useTeacherQuizAttempts,
  type QuizAttemptRecord,
} from '../hooks/useLearningData'
import { useRealtimeCount } from '../hooks/useRealtimeCount'
import { useTeacherRequests } from '../hooks/useTeacherRequests'
import {
  approveStudentRequest,
  createTeacherClass,
  joinClass,
  rejectStudentRequest,
} from '../services/classroom'
import {
  getCourseById,
  getCoursesForClass,
  getQuestionsForTest,
  getTestById,
  prepareQuestions,
  submitQuizAttempt,
  type CourseSubject,
  type PreparedQuestion,
  type QuizQuestion,
} from '../services/learning'
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
  studentId: string
  quizAttempts: number
  averageScore: string
  latestScore: string
  completion: string
}

const classOptions = ['Class 8', 'Class 9', 'Class 10']
const testDurationSeconds = 5 * 60

interface QuizSession {
  course: CourseSubject
  questions: QuizQuestion[]
  startedAt: Date
  testId: string
}

interface QuizResult {
  correct: number
  percentage: number
  score: number
  wrong: number
  durationSeconds: number
  attemptNumber?: number
}

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getCompletionPercentage = (attempts: QuizAttemptRecord[], courses: CourseSubject[]) => {
  const totalTests = courses.reduce((total, course) => total + course.tests.length, 0)

  if (!totalTests) {
    return 0
  }

  const completedTests = new Set(attempts.map((attempt) => `${attempt.courseId}_${attempt.testId}`)).size

  return Math.round((completedTests / totalTests) * 100)
}

const getSubjectAverages = (attempts: QuizAttemptRecord[]) => {
  const grouped = attempts.reduce<Record<string, number[]>>((subjects, attempt) => {
    subjects[attempt.subject] = [...(subjects[attempt.subject] ?? []), attempt.percentage]
    return subjects
  }, {})

  return Object.entries(grouped).map(([subject, percentages]) => ({
    average: average(percentages),
    subject,
  }))
}

const getStudentPerformanceRows = (attempts: QuizAttemptRecord[]) => {
  const grouped = attempts.reduce<Record<string, QuizAttemptRecord[]>>((students, attempt) => {
    students[attempt.studentId] = [...(students[attempt.studentId] ?? []), attempt]
    return students
  }, {})

  return Object.entries(grouped).map(([studentId, records]) => ({
    average: average(records.map((record) => record.percentage)),
    attempts: records.length,
    studentId,
    studentName: records[0]?.studentName ?? 'Student',
  }))
}

function TeacherDashboard() {
  const { user, userProfile } = useAuth()
  const [selectedClass, setSelectedClass] = useState(classOptions[0])
  const [createdClassId, setCreatedClassId] = useState('')
  const [schoolName, setSchoolName] = useState('School')
  const [creatingClass, setCreatingClass] = useState(false)
  const teacherId = user?.uid
  const schoolId = userProfile?.schoolId
  const classes = useTeacherClasses(teacherId, schoolId)
  const pendingStudents = usePendingStudentRequests(schoolId)
  const memberships = useTeacherClassMemberships(teacherId, schoolId)
  const teacherAttempts = useTeacherQuizAttempts(teacherId, schoolId)
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'classrooms' | 'approvals' | 'analytics' | 'profile'>('dashboard')

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

  const studentRows: JoinedStudentRow[] = memberships.records.map((membership) => {
    const studentAttempts = teacherAttempts.records.filter(
      (attempt) => attempt.studentId === membership.studentId,
    )
    const sortedAttempts = [...studentAttempts].sort((a, b) => {
      const timeA = a.submittedAt?.toDate?.().getTime() ?? 0
      const timeB = b.submittedAt?.toDate?.().getTime() ?? 0
      return timeB - timeA
    })
    const quizAttemptsCount = studentAttempts.length
    const averageScoreVal = studentAttempts.length
      ? Math.round(studentAttempts.reduce((sum, a) => sum + a.percentage, 0) / studentAttempts.length)
      : 0
    const latestScoreVal = sortedAttempts[0] ? `${sortedAttempts[0].percentage}%` : 'N/A'
    const studentCourses = getCoursesForClass(membership.className)
    const totalTests = studentCourses.reduce((sum, c) => sum + c.tests.length, 0)
    const uniqueCompleted = new Set(
      studentAttempts.map((attempt) => `${attempt.courseId}_${attempt.testId}`),
    ).size
    const completion = totalTests ? Math.min(100, Math.round((uniqueCompleted / totalTests) * 100)) : 0

    return {
      className: membership.className,
      email: membership.studentEmail || 'Not available',
      fullName: membership.studentName || 'Student',
      joinedAt: membership.joinedAt,
      lastActivityAt: membership.lastActivityAt,
      membershipId: membership.id,
      studentId: membership.studentId,
      quizAttempts: quizAttemptsCount,
      averageScore: `${averageScoreVal}%`,
      latestScore: latestScoreVal,
      completion: `${completion}%`,
    }
  })
  const studentPerformanceRows = getStudentPerformanceRows(teacherAttempts.records)
  const subjectAverages = getSubjectAverages(teacherAttempts.records)
  const weakStudents = studentPerformanceRows.filter((student) => student.average < 50)
  const strongStudents = studentPerformanceRows.filter((student) => student.average >= 80)
  const completionPercentage = classes.records.length
    ? Math.round(
        (new Set(teacherAttempts.records.map((attempt) => `${attempt.studentId}_${attempt.courseId}_${attempt.testId}`)).size /
          (classes.records.length * 6)) *
          100,
      )
    : 0

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
    teacherAttempts.error ??
    quizAttempts.error ??
    attendance.error

  const displayName = userProfile?.fullName ?? 'Teacher'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="tdb-layout">

      {/* ─── Sidebar Navigation ─── */}
      <aside className="tdb-sidebar">
        <div className="tdb-sidebar-inner">
          <div className="tdb-brand">
            <div className="tdb-brand-icon"><GraduationCap /></div>
            <span className="tdb-brand-name">StudyHub</span>
          </div>

          <span className="tdb-nav-label">Navigation</span>

          <nav className="tdb-nav">
            <button
              className={`tdb-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} /> Overview
            </button>
            <button
              className={`tdb-nav-item ${activeTab === 'classrooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('classrooms')}
            >
              <School size={16} /> Classrooms
            </button>
            <button
              className={`tdb-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <UserCheck size={16} /> Approvals
              {pendingStudents.records.length > 0 && (
                <span className="sdb-test-badge green" style={{ marginLeft: 'auto' }}>
                  {pendingStudents.records.length}
                </span>
              )}
            </button>
            <button
              className={`tdb-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <ChartColumn size={16} /> Analytics
            </button>
            <button
              className={`tdb-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} /> Profile
            </button>
          </nav>

          <div className="tdb-sidebar-footer">
            <button className="tdb-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="tdb-main">
        {firstError ? <ErrorState message={firstError} /> : null}

        {/* ─── 1. Overview Tab ─── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Overview</h1>
                <p className="sdb-page-sub">Dashboard metrics and stats summary</p>
              </div>
            </div>

            {/* Glossy Welcome Card */}
            <div className="sdb-welcome-card glossy">
              <div className="sdb-welcome-left">
                <div className="sdb-avatar">{initial}</div>
                <div>
                  <p className="sdb-welcome-greeting">Welcome back,</p>
                  <p className="sdb-welcome-name">{displayName}</p>
                  <div className="sdb-welcome-meta">
                    <span className="sdb-meta-item">
                      <Building2 />
                      <span className="sdb-meta-label">School:</span>
                      <span className="sdb-meta-value">{schoolName}</span>
                    </span>
                    <span className="sdb-meta-item">
                      <User />
                      <span className="sdb-meta-label">Role:</span>
                      <span className="sdb-meta-value">Class Instructor</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="sdb-stats-row">
              <div className="sdb-stat-card indigo">
                <div className="sdb-stat-icon"><School size={16} /></div>
                <div className="sdb-stat-label">Total Classes</div>
                <div className="sdb-stat-value">{classes.records.length}</div>
                <div className="sdb-stat-hint">Active cohorts</div>
              </div>
              <div className="sdb-stat-card green">
                <div className="sdb-stat-icon"><Users size={16} /></div>
                <div className="sdb-stat-label">Students Joined</div>
                <div className="sdb-stat-value">{memberships.records.length}</div>
                <div className="sdb-stat-hint">Enrolled class members</div>
              </div>
              <div className="sdb-stat-card amber">
                <div className="sdb-stat-icon"><UserCheck size={16} /></div>
                <div className="sdb-stat-label">Approvals Pending</div>
                <div className="sdb-stat-value">{pendingStudents.records.length}</div>
                <div className="sdb-stat-hint">Requests in queue</div>
              </div>
              <div className="sdb-stat-card blue">
                <div className="sdb-stat-icon"><BookOpen size={16} /></div>
                <div className="sdb-stat-label">Quiz Attempts</div>
                <div className="sdb-stat-value">{quizAttempts.count}</div>
                <div className="sdb-stat-hint">Test submissions</div>
              </div>
            </div>

            <div className="sdb-stats-row">
              <div className="sdb-stat-card green">
                <div className="sdb-stat-icon"><BarChart3 size={16} /></div>
                <div className="sdb-stat-label">Average Marks</div>
                <div className="sdb-stat-value">
                  {teacherAttempts.records.length ? `${Math.round(average(teacherAttempts.records.map((a) => a.percentage)))}%` : '—'}
                </div>
                <div className="sdb-stat-hint">Cohort average</div>
              </div>
              <div className="sdb-stat-card indigo">
                <div className="sdb-stat-icon"><Check size={16} /></div>
                <div className="sdb-stat-label">Attendance Count</div>
                <div className="sdb-stat-value">{attendance.count}</div>
                <div className="sdb-stat-hint">Checked-in records</div>
              </div>
              <div className="sdb-stat-card blue">
                <div className="sdb-stat-icon"><GraduationCap size={16} /></div>
                <div className="sdb-stat-label">Active Students</div>
                <div className="sdb-stat-value">
                  {new Set(memberships.records.map((membership) => membership.studentId)).size}
                </div>
                <div className="sdb-stat-hint">Participated in quiz</div>
              </div>
              <div className="sdb-stat-card amber">
                <div className="sdb-stat-icon"><Target size={16} /></div>
                <div className="sdb-stat-label">Completion</div>
                <div className="sdb-stat-value">{completionPercentage}%</div>
                <div className="sdb-stat-hint">Overall class completion</div>
              </div>
            </div>
          </>
        )}

        {/* ─── 2. Classrooms Tab ─── */}
        {activeTab === 'classrooms' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Classrooms Management</h1>
                <p className="sdb-page-sub">Create classes and manage registered classrooms</p>
              </div>
            </div>

            {/* Create Class widget */}
            <div className="sdb-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Create New Class</h3>
              <div className="tdb-tool-bar">
                <select className="tdb-select" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button className="sdb-quiz-btn-primary" disabled={creatingClass} type="button" onClick={handleCreateClass}>
                  <Plus size={14} style={{ marginRight: '6px' }} />
                  {creatingClass ? 'Creating...' : 'Create Class'}
                </button>
              </div>
              {createdClassId && (
                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--sdb-muted)', marginBottom: '4px' }}>Class created successfully! Click to copy ID:</span>
                  <div className="tdb-copy-badge" onClick={() => copyClassId(createdClassId)}>
                    <Copy size={12} style={{ marginRight: '6px' }} /> {createdClassId}
                  </div>
                </div>
              )}
            </div>

            {/* Classroom records */}
            <div className="sdb-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0' }}>Registered Classes</h3>
              {classes.loading && <SkeletonGrid items={2} />}
              {!classes.loading && classes.records.length === 0 && <div className="sdb-empty">No classes created yet.</div>}
              {!classes.loading && classes.records.length > 0 && (
                <div className="tdb-table-card" style={{ marginTop: '12px' }}>
                  <div className="tdb-table-row tdb-table-header">
                    <div>Class Name</div>
                    <div>Status</div>
                    <div>Created Date</div>
                    <div>Actions</div>
                  </div>
                  {classes.records.map((c) => (
                    <div className="tdb-table-row" key={c.classId}>
                      <div className="tdb-table-cell-bold">{c.className}</div>
                      <div>
                        <span className="sdb-test-badge green" style={{ textTransform: 'capitalize' }}>{c.status}</span>
                      </div>
                      <div>{formatTimestamp(c.createdAt)}</div>
                      <div>
                        <button className="sdb-continue-mini-btn" onClick={() => copyClassId(c.classId)}>
                          <Copy size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Copy ID
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enrolled Students Table */}
            <div className="sdb-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0' }}>Enrolled Class Students</h3>
              {memberships.loading && <SkeletonGrid items={2} />}
              {!memberships.loading && studentRows.length === 0 && <div className="sdb-empty">No students registered yet.</div>}
              {!memberships.loading && studentRows.length > 0 && (
                <div className="tdb-table-card" style={{ marginTop: '12px', overflowX: 'auto' }}>
                  <div className="tdb-table-row tdb-table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}>
                    <div>Student</div>
                    <div>Classroom</div>
                    <div>Joined Date</div>
                    <div>Quiz Average</div>
                    <div>Latest Score</div>
                    <div>Progress</div>
                  </div>
                  {studentRows.map((student) => (
                    <div className="tdb-table-row" key={student.membershipId} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}>
                      <div>
                        <span className="tdb-table-cell-bold">{student.fullName}</span>
                        <span className="tdb-table-cell-sub">{student.email}</span>
                      </div>
                      <div>{student.className}</div>
                      <div>{formatTimestamp(student.joinedAt)}</div>
                      <div className="tdb-table-cell-bold" style={{ color: 'var(--sdb-primary)' }}>{student.averageScore}</div>
                      <div>{student.latestScore}</div>
                      <div>
                        <span className="sdb-test-badge blue">{student.completion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── 3. Approvals Tab ─── */}
        {activeTab === 'approvals' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Approval Queue</h1>
                <p className="sdb-page-sub">Approve or reject student classroom membership requests</p>
              </div>
            </div>

            {pendingStudents.loading && <SkeletonGrid items={2} />}
            {!pendingStudents.loading && pendingStudents.records.length === 0 && (
              <div className="sdb-card">
                <div className="sdb-empty" style={{ padding: '40px 0' }}>
                  <div className="sdb-empty-icon"><UserCheck size={20} /></div>
                  <p className="sdb-empty-title">Queue is clear</p>
                  <p className="sdb-empty-desc">No pending student requests at this time.</p>
                </div>
              </div>
            )}

            {!pendingStudents.loading && pendingStudents.records.length > 0 && (
              <div className="sdb-chapter-grid">
                {pendingStudents.records.map((request) => (
                  <article className="sdb-chapter-card" key={request.id}>
                    <div className="sdb-chapter-card-top test">
                      <div className="sdb-chapter-card-icon">
                        <UserCheck />
                      </div>
                    </div>
                    <div className="sdb-chapter-card-body">
                      <div className="sdb-chapter-card-info">
                        <span className="sdb-chapter-card-meta">Approval Request</span>
                        <h4 className="sdb-chapter-card-title">{request.fullName}</h4>
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--sdb-muted)' }}>
                          <div style={{ marginBottom: '2px' }}><strong>Email:</strong> {request.email}</div>
                          <div><strong>Requested:</strong> {formatTimestamp(request.requestedDate)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          className="sdb-quiz-btn-primary" 
                          type="button" 
                          onClick={() => approveStudent(request.id)}
                          style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', minHeight: '32px' }}
                        >
                          Approve
                        </button>
                        <button 
                          className="sdb-quiz-btn-secondary" 
                          type="button" 
                          onClick={() => rejectStudent(request.id)}
                          style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', minHeight: '32px', color: 'var(--sdb-danger)', borderColor: '#FECACA' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── 4. Analytics Tab ─── */}
        {activeTab === 'analytics' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Learning Analytics</h1>
                <p className="sdb-page-sub">Evaluate subject performance and grade spreads</p>
              </div>
            </div>

            {teacherAttempts.loading && <SkeletonGrid items={2} />}
            {!teacherAttempts.loading && teacherAttempts.records.length === 0 && (
              <div className="sdb-card">
                <div className="sdb-empty" style={{ padding: '40px 0' }}>No quiz attempts submitted yet.</div>
              </div>
            )}

            {!teacherAttempts.loading && teacherAttempts.records.length > 0 && (
              <>
                <div className="sdb-2col">
                  {/* Recent attempts */}
                  <div className="sdb-card">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Recent Attempts</h3>
                    <div className="sdb-course-list">
                      {teacherAttempts.records.slice(0, 6).map((attempt) => (
                        <div className="sdb-course-item" key={attempt.id} style={{ padding: '8px 0' }}>
                          <div className="sdb-course-info">
                            <div className="sdb-course-name" style={{ fontSize: '0.85rem' }}>{attempt.studentName}</div>
                            <div className="sdb-course-sub" style={{ fontSize: '0.72rem' }}>{attempt.subject} · {attempt.testTitle}</div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: attempt.percentage >= 60 ? 'var(--sdb-success)' : 'var(--sdb-danger)' }}>{attempt.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject averages */}
                  <div className="sdb-card">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Subject Performance</h3>
                    <div className="sdb-course-list">
                      {subjectAverages.map((item) => (
                        <div className="sdb-course-item" key={item.subject} style={{ padding: '10px 0' }}>
                          <div className="sdb-course-info">
                            <div className="sdb-course-name" style={{ fontSize: '0.85rem' }}>{item.subject}</div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sdb-primary)' }}>{Math.round(item.average)}% avg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sdb-2col">
                  {/* Strong students */}
                  <div className="sdb-card">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Top Performers</h3>
                    <div className="sdb-course-list">
                      {(strongStudents.length ? strongStudents : studentPerformanceRows.slice(0, 3)).map((student) => (
                        <div className="sdb-course-item" key={student.studentId} style={{ padding: '8px 0' }}>
                          <div className="sdb-course-info">
                            <div className="sdb-course-name" style={{ fontSize: '0.85rem' }}>{student.studentName}</div>
                            <div className="sdb-course-sub" style={{ fontSize: '0.72rem' }}>{student.attempts} attempts</div>
                          </div>
                          <span className="sdb-test-badge green">{Math.round(student.average)}% avg</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weak students */}
                  <div className="sdb-card">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Needs Attention</h3>
                    <div className="sdb-course-list">
                      {(weakStudents.length ? weakStudents : studentPerformanceRows.slice(-3)).map((student) => (
                        <div className="sdb-course-item" key={student.studentId} style={{ padding: '8px 0' }}>
                          <div className="sdb-course-info">
                            <div className="sdb-course-name" style={{ fontSize: '0.85rem' }}>{student.studentName}</div>
                            <div className="sdb-course-sub" style={{ fontSize: '0.72rem' }}>{student.attempts} attempts</div>
                          </div>
                          <span className="sdb-test-badge amber">{Math.round(student.average)}% avg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ─── 5. Profile Tab ─── */}
        {activeTab === 'profile' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Profile</h1>
                <p className="sdb-page-sub">View and manage your instructor account details</p>
              </div>
            </div>

            <div className="sdb-card">
              <div className="sdb-section-hd" style={{ borderBottom: '1px solid var(--sdb-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span className="sdb-section-title"><User size={16} /> Teacher Details</span>
              </div>

              <dl className="profile-list learning-profile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>School</dt>
                  <dd style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sdb-text)', margin: 0 }}>{schoolName}</dd>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>Email</dt>
                  <dd style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sdb-text)', margin: 0 }}>{userProfile?.email}</dd>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>Status</dt>
                  <dd style={{ margin: 0 }}>
                    <span className="status-badge approved" style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#DCFCE7', color: '#166534' }}>Active</span>
                  </dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StudentDashboard() {
  const { user, userProfile } = useAuth()
  const studentProfile = useStudentProfile(user?.uid)
  const memberships = useStudentClassMemberships(user?.uid, userProfile?.schoolId)
  const attempts = useStudentQuizAttempts(user?.uid, userProfile?.schoolId)
  const [classId, setClassId] = useState('')
  const [joining, setJoining] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const joinedClass = memberships.records[0] ?? null
  const courses = useMemo(() => getCoursesForClass(joinedClass?.className), [joinedClass?.className])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const selectedCourse = useMemo(
    () => getCourseById(joinedClass?.className, selectedCourseId) ?? courses[0] ?? null,
    [courses, joinedClass?.className, selectedCourseId],
  )
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [visitedQuestionIds, setVisitedQuestionIds] = useState<Set<string>>(new Set())
  const [remainingSeconds, setRemainingSeconds] = useState(testDurationSeconds)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  // Sub-navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'analytics' | 'profile'>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<'prastuti' | 'anubhav' | 'geomagic' | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [reviewQuestions, setReviewQuestions] = useState<QuizQuestion[] | null>(null)
  const [reviewMode, setReviewMode] = useState(false)
  const [activeSubjectTab, setActiveSubjectTab] = useState<'videos' | 'materials' | 'tests'>('videos')
  const [lastQuizCourse, setLastQuizCourse] = useState<CourseSubject | null>(null)
  const [lastQuizTestId, setLastQuizTestId] = useState<string>('')

  const preparedQuestions = useMemo<PreparedQuestion[]>(
    () => (quizSession ? prepareQuestions(quizSession.questions) : []),
    [quizSession],
  )
  const currentQuestion = preparedQuestions[currentQuestionIndex]
  const averageScore = average(attempts.records.map((attempt) => attempt.percentage))
  const highestScore = attempts.records.length
    ? Math.max(...attempts.records.map((attempt) => attempt.percentage))
    : 0
  const lowestScore = attempts.records.length
    ? Math.min(...attempts.records.map((attempt) => attempt.percentage))
    : 0
  const subjectAverages = getSubjectAverages(attempts.records)
  const completionPercentage = getCompletionPercentage(attempts.records, courses)

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
        studentEmail: studentProfile.record?.email || userProfile.email || user.email || '',
        studentName: studentProfile.record?.fullName || userProfile.fullName || user.displayName || 'Student',
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



  const finishQuiz = useCallback(async () => {
    if (!quizSession || !joinedClass || !user?.uid || !userProfile?.schoolId) {
      return
    }

    const test = getTestById(quizSession.course, quizSession.testId)

    if (!test) {
      return
    }

    setSubmittingQuiz(true)

    try {
      const durationSeconds = Math.min(
        testDurationSeconds,
        Math.max(0, Math.round((Date.now() - quizSession.startedAt.getTime()) / 1000)),
      )
      const attemptCount = attempts.records.filter(
        (record) => record.courseId === quizSession.course.id && record.testId === test.id,
      ).length
      const attemptNumber = attemptCount + 1

      const result = await submitQuizAttempt({
        answers,
        classId: joinedClass.classId,
        className: joinedClass.className,
        courseId: quizSession.course.id,
        durationSeconds,
        questions: quizSession.questions,
        schoolId: userProfile.schoolId,
        startedAt: quizSession.startedAt,
        studentId: user.uid,
        studentName: studentProfile.record?.fullName ?? userProfile.fullName,
        subject: quizSession.course.name,
        teacherId: joinedClass.teacherId,
        testId: test.id,
        testTitle: test.title,
        attemptNumber,
      })
      setQuizResult({ ...result, durationSeconds })
      setReviewQuestions(quizSession.questions)
      setQuizSession(null)
      toast.success('Test submitted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit test.')
    } finally {
      setSubmittingQuiz(false)
    }
  }, [answers, attempts.records, joinedClass, quizSession, studentProfile.record, user, userProfile])

  useEffect(() => {
    if (!quizSession || submittingQuiz) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      const elapsedSeconds = Math.round((Date.now() - quizSession.startedAt.getTime()) / 1000)
      const nextRemainingSeconds = Math.max(0, testDurationSeconds - elapsedSeconds)
      setRemainingSeconds(nextRemainingSeconds)

      if (nextRemainingSeconds === 0) {
        window.clearInterval(timerId)
        void finishQuiz()
      }
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [finishQuiz, quizSession, submittingQuiz])

  useEffect(() => {
    if (!currentQuestion) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisitedQuestionIds((current) => {
      const next = new Set(current)
      next.add(currentQuestion.id)
      return next
    })
  }, [currentQuestion])

  const startQuiz = (course: CourseSubject, testId: string) => {
    const test = getTestById(course, testId)

    if (!test) {
      return
    }

    setLastQuizCourse(course)
    setLastQuizTestId(testId)

    setQuizSession({
      course,
      questions: getQuestionsForTest(course, test),
      startedAt: new Date(),
      testId,
    })
    setAnswers({})
    setCurrentQuestionIndex(0)
    setVisitedQuestionIds(new Set())
    setRemainingSeconds(testDurationSeconds)
    setQuizResult(null)
    setReviewQuestions(null)
    setReviewMode(false)
  }



  // Welcome card with current date
  const renderWelcomeCard = () => {
    const displayName = studentProfile.record?.fullName ?? userProfile?.fullName ?? 'Student'
    const initial    = displayName.charAt(0).toUpperCase()
    const studentId  = user?.uid ?? '—'
    const schoolName = studentProfile.record?.schoolName ?? 'Not set'
    const className  = joinedClass?.className ?? 'Not joined'

    const now = new Date()
    const dayName = now.toLocaleDateString('en-IN', { weekday: 'long' })
    const fullDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div className="sdb-welcome-card glossy">
        <div className="sdb-welcome-left">
          <div className="sdb-avatar">{initial}</div>
          <div>
            <p className="sdb-welcome-greeting">Good day,</p>
            <p className="sdb-welcome-name">{displayName}</p>
            <div className="sdb-welcome-meta">
              <span className="sdb-meta-item">
                <IdCard />
                <span className="sdb-meta-label">ID:</span>
                <span className="sdb-meta-value">{studentId}</span>
              </span>
              <span className="sdb-meta-item">
                <Building2 />
                <span className="sdb-meta-label">School:</span>
                <span className="sdb-meta-value">{schoolName}</span>
              </span>
              <span className="sdb-meta-item">
                <BookOpen />
                <span className="sdb-meta-label">Class:</span>
                <span className="sdb-meta-value">{className}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="sdb-welcome-right">
          <div className="sdb-page-date">
            <span className="sdb-date-day">{dayName}</span>
            <strong>{fullDate}</strong>
          </div>
          <button className="sdb-continue-btn" onClick={() => setActiveTab('courses')}>
            Continue Learning <ChevronRight size={13} />
          </button>
        </div>
      </div>
    )
  }

  const firstError = studentProfile.error ?? memberships.error ?? attempts.error

  // Render Quiz Session (CBT Mode)
  if (quizSession && currentQuestion) {
    return (
      <div className="sdb-layout" style={{ gridTemplateColumns: '1fr' }}>
        <main className="sdb-main" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Page header */}
          <div className="sdb-page-header">
            <div>
              <h1 className="sdb-page-title">{getTestById(quizSession.course, quizSession.testId)?.title ?? 'Practice Test'}</h1>
              <p className="sdb-page-sub">{quizSession.course.name}</p>
            </div>
            <div className="sdb-page-date">
              <span className="sdb-date-day">Remaining Time</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--sdb-danger)' }}>{formatDuration(remainingSeconds)}</strong>
            </div>
          </div>

          {/* Two column grid */}
          <div className="sdb-quiz-grid">
            {/* Left Column: Question & Controls */}
            <div className="sdb-quiz-left">
              <article className="sdb-card sdb-quiz-card">
                <span className="sdb-quiz-card-header">Question {currentQuestionIndex + 1} of {preparedQuestions.length}</span>
                <h3 className="sdb-quiz-prompt">{currentQuestion.prompt.replace(/^\[[^\]]+\]\s*/, '')}</h3>
                <div className="sdb-option-grid">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion.id] === option
                    const letter = String.fromCharCode(65 + idx) // A, B, C, D
                    return (
                      <button
                        className={`sdb-option-btn ${isSelected ? 'selected' : ''}`}
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option }))}
                      >
                        <span style={{ fontWeight: 600, marginRight: '10px', color: isSelected ? 'var(--sdb-primary)' : 'var(--sdb-muted)' }}>{letter}.</span>
                        {option}
                      </button>
                    )
                  })}
                </div>
              </article>

              <div className="sdb-quiz-controls">
                <button
                  className="sdb-quiz-btn-secondary"
                  disabled={currentQuestionIndex === 0}
                  type="button"
                  onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
                >
                  Previous
                </button>
                <button
                  className="sdb-quiz-btn-secondary"
                  disabled={currentQuestionIndex === preparedQuestions.length - 1}
                  type="button"
                  onClick={() => setCurrentQuestionIndex((index) => Math.min(preparedQuestions.length - 1, index + 1))}
                >
                  Next
                </button>
                <button className="sdb-quiz-btn-primary" disabled={submittingQuiz} type="button" onClick={() => void finishQuiz()}>
                  {submittingQuiz ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            </div>

            {/* Right Column: Question Numbers Grid */}
            <div className="sdb-quiz-right">
              <div className="sdb-card sdb-nav-card">
                <h4 className="sdb-nav-title">Questions</h4>
                <div className="sdb-nav-grid">
                  {preparedQuestions.map((question, index) => {
                    const isAnswered = Boolean(answers[question.id])
                    const isVisited = visitedQuestionIds.has(question.id)
                    const statusClass = isAnswered ? 'answered' : (isVisited ? 'visited' : 'not-visited')

                    return (
                      <button
                        className={`sdb-nav-btn ${statusClass} ${index === currentQuestionIndex ? 'active' : ''}`}
                        key={question.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                <div className="sdb-nav-legend">
                  <div className="sdb-legend-item">
                    <span className="sdb-legend-dot answered" />
                    <span>Answered</span>
                  </div>
                  <div className="sdb-legend-item">
                    <span className="sdb-legend-dot visited" />
                    <span>Visited</span>
                  </div>
                  <div className="sdb-legend-item">
                    <span className="sdb-legend-dot not-visited" />
                    <span>Not Visited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Render Dedicated Result Page
  if (quizResult) {
    if (reviewMode && reviewQuestions) {
      const activeReviewQuestion = reviewQuestions[currentQuestionIndex]
      return (
        <div className="sdb-layout" style={{ gridTemplateColumns: '1fr' }}>
          <main className="sdb-main" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {/* Page header */}
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Review Answers</h1>
                <p className="sdb-page-sub">Reviewing Test Performance</p>
              </div>
              <button 
                className="sdb-continue-btn" 
                type="button" 
                onClick={() => {
                  setReviewMode(false)
                  setCurrentQuestionIndex(0)
                }}
              >
                Back to Results
              </button>
            </div>

            <div className="sdb-quiz-grid">
              {/* Left Column: Question Review */}
              <div className="sdb-quiz-left">
                {activeReviewQuestion && (
                  <article className="sdb-card sdb-quiz-card">
                    <span className="sdb-quiz-card-header">Question {currentQuestionIndex + 1} of {reviewQuestions.length}</span>
                    <h3 className="sdb-quiz-prompt">{activeReviewQuestion.prompt.replace(/^\[[^\]]+\]\s*/, '')}</h3>
                    <div className="sdb-option-grid">
                      {activeReviewQuestion.options.map((option, idx) => {
                        const userAnswer = answers[activeReviewQuestion.id] ?? ''
                        const correctAnswer = activeReviewQuestion.answer
                        const letter = String.fromCharCode(65 + idx) // A, B, C, D
                        
                        let optionClass = ''
                        if (option === correctAnswer) {
                          optionClass = 'correct'
                        } else if (option === userAnswer && userAnswer !== correctAnswer) {
                          optionClass = 'wrong'
                        } else if (option === userAnswer) {
                          optionClass = 'selected'
                        }
                        
                        return (
                          <button
                            className={`sdb-option-btn-review ${optionClass}`}
                            key={option}
                            disabled
                            type="button"
                          >
                            <div className="sdb-review-option-content">
                              <span>
                                <span style={{ fontWeight: 600, marginRight: '10px', opacity: 0.8 }}>{letter}.</span>
                                {option}
                              </span>
                              {option === correctAnswer && <Check className="sdb-review-icon correct" />}
                              {option === userAnswer && userAnswer !== correctAnswer && <X className="sdb-review-icon wrong" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </article>
                )}

                <div className="sdb-quiz-controls">
                  <button
                    className="sdb-quiz-btn-secondary"
                    disabled={currentQuestionIndex === 0}
                    type="button"
                    onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="sdb-quiz-btn-secondary"
                    disabled={currentQuestionIndex === reviewQuestions.length - 1}
                    type="button"
                    onClick={() => setCurrentQuestionIndex((index) => Math.min(reviewQuestions.length - 1, index + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Right Column: Question Numbers Grid */}
              <div className="sdb-quiz-right">
                <div className="sdb-card sdb-nav-card">
                  <h4 className="sdb-nav-title">Questions</h4>
                  <div className="sdb-nav-grid">
                    {reviewQuestions.map((question, index) => {
                      const userAnswer = answers[question.id] ?? ''
                      const isCorrect = userAnswer === question.answer
                      const statusClass = isCorrect ? 'correct' : 'wrong'

                      return (
                        <button
                          className={`sdb-nav-btn review ${statusClass} ${index === currentQuestionIndex ? 'active' : ''}`}
                          key={question.id}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          {index + 1}
                        </button>
                      )
                    })}
                  </div>
                  <div className="sdb-nav-legend">
                    <div className="sdb-legend-item">
                      <span className="sdb-legend-dot correct" />
                      <span>Correct</span>
                    </div>
                    <div className="sdb-legend-item">
                      <span className="sdb-legend-dot wrong" />
                      <span>Incorrect</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )
    }

    const passed = quizResult.percentage >= 60
    return (
      <div className="sdb-layout" style={{ gridTemplateColumns: '1fr' }}>
        <main className="sdb-main">
          <div className="sdb-results-container">
            {/* Page header */}
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Test Results</h1>
                <p className="sdb-page-sub">Performance review and scorecard</p>
              </div>
            </div>

            {/* Scorecard Box */}
            <div className="sdb-card sdb-score-card">
              <div className={`sdb-score-circle ${passed ? 'pass' : 'fail'}`}>
                {quizResult.percentage}%
              </div>
              <h3 className="sdb-results-title">{passed ? 'Congratulations!' : 'Keep Learning!'}</h3>
              <p className="sdb-results-desc">
                You answered {quizResult.score} out of {quizResult.score + quizResult.wrong} questions correctly.
                {passed ? ' Excellent work on completing the quiz.' : ' Review your answers and try again to improve your score.'}
              </p>
            </div>

            {/* Detailed stats grid */}
            <div className="sdb-results-stats">
              <div className="sdb-stat-card green">
                <div className="sdb-stat-icon"><Check size={16} /></div>
                <div className="sdb-stat-label">Correct Answers</div>
                <div className="sdb-stat-value">{quizResult.correct}</div>
                <div className="sdb-stat-hint">Valid answers</div>
              </div>
              <div className="sdb-stat-card amber">
                <div className="sdb-stat-icon"><X size={16} /></div>
                <div className="sdb-stat-label">Wrong Answers</div>
                <div className="sdb-stat-value">{quizResult.wrong}</div>
                <div className="sdb-stat-hint">Incorrect options</div>
              </div>
              <div className="sdb-stat-card blue">
                <div className="sdb-stat-icon"><Clock size={16} /></div>
                <div className="sdb-stat-label">Time Taken</div>
                <div className="sdb-stat-value">{formatDuration(quizResult.durationSeconds)}</div>
                <div className="sdb-stat-hint">Total test duration</div>
              </div>
              <div className="sdb-stat-card indigo">
                <div className="sdb-stat-icon"><Award size={16} /></div>
                <div className="sdb-stat-label">Attempt Number</div>
                <div className="sdb-stat-value">{quizResult.attemptNumber ?? 1}</div>
                <div className="sdb-stat-hint">Attempts recorded</div>
              </div>
            </div>

            {/* Controls */}
            <div className="sdb-results-actions">
              <button 
                className="sdb-quiz-btn-primary" 
                type="button" 
                onClick={() => { setReviewMode(true); setCurrentQuestionIndex(0); }}
              >
                Review Answers
              </button>
              <button 
                className="sdb-quiz-btn-secondary" 
                type="button" 
                onClick={() => {
                  if (lastQuizCourse && lastQuizTestId) {
                    startQuiz(lastQuizCourse, lastQuizTestId)
                  }
                }}
              >
                Retest
              </button>
              <button 
                className="sdb-quiz-btn-secondary" 
                type="button" 
                onClick={() => {
                  setQuizResult(null)
                  setReviewQuestions(null)
                  setReviewMode(false)
                }}
              >
                Back to Course
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="sdb-layout">

      {/* ─── Sidebar ─── */}
      <aside className="sdb-sidebar">
        <div className="sdb-sidebar-inner">
          {/* Brand */}
          <div className="sdb-brand">
            <div className="sdb-brand-icon"><GraduationCap /></div>
            <span className="sdb-brand-name">StudyHub</span>
          </div>

          <span className="sdb-nav-label">Navigation</span>

          {/* Nav items */}
          <nav className="sdb-nav">
            <button
              className={`sdb-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setQuizResult(null); setReviewQuestions(null) }}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              className={`sdb-nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => { setActiveTab('courses'); setQuizResult(null); setReviewQuestions(null) }}
            >
              <BookOpen size={16} /> My Courses
            </button>
            <button
              className={`sdb-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { setActiveTab('analytics'); setQuizResult(null); setReviewQuestions(null) }}
            >
              <ChartColumn size={16} /> Analytics
            </button>
            <button
              className={`sdb-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setQuizResult(null); setReviewQuestions(null) }}
            >
              <User size={16} /> Profile
            </button>
          </nav>

          {/* Footer logout */}
          <div className="sdb-sidebar-footer">
            <button className="sdb-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="sdb-main">
        {firstError ? <ErrorState message={firstError} /> : null}

        {/* ─── 1. Dashboard Tab ─── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Page header */}
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Dashboard</h1>
                <p className="sdb-page-sub">Overview of your learning progress</p>
              </div>
            </div>

            {/* Welcome card */}
            {renderWelcomeCard()}

            {/* Stats */}
            <div className="sdb-stats-row">
              <div className="sdb-stat-card indigo">
                <div className="sdb-stat-icon"><Target size={16} /></div>
                <div className="sdb-stat-label">Overall Progress</div>
                <div className="sdb-stat-value">{completionPercentage}%</div>
                <div className="sdb-stat-hint">Course completion rate</div>
              </div>
              <div className="sdb-stat-card blue">
                <div className="sdb-stat-icon"><ClipboardList size={16} /></div>
                <div className="sdb-stat-label">Tests Completed</div>
                <div className="sdb-stat-value">
                  {new Set(attempts.records.map((a) => `${a.courseId}_${a.testId}`)).size}
                </div>
                <div className="sdb-stat-hint">Unique tests attempted</div>
              </div>
              <div className="sdb-stat-card green">
                <div className="sdb-stat-icon"><ChartColumn size={16} /></div>
                <div className="sdb-stat-label">Average Score</div>
                <div className="sdb-stat-value">{averageScore}%</div>
                <div className="sdb-stat-hint">{attempts.records.length > 0 ? `Best: ${highestScore}%` : 'No tests yet'}</div>
              </div>
              <div className="sdb-stat-card amber">
                <div className="sdb-stat-icon"><Check size={16} /></div>
                <div className="sdb-stat-label">Attendance</div>
                <div className="sdb-stat-value">—</div>
                <div className="sdb-stat-hint">Coming soon</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="sdb-section-hd">
                <span className="sdb-section-title"><LayoutDashboard size={15} /> Quick Actions</span>
              </div>
              <div className="sdb-actions-grid">
                <button className="sdb-action-card indigo" onClick={() => setActiveTab('courses')}>
                  <div className="sdb-action-icon-wrap"><BookOpen size={16} /></div>
                  <p className="sdb-action-title">Browse Courses</p>
                  <p className="sdb-action-desc">Access video lectures, notes, and tests</p>
                  <span className="sdb-action-arrow"><ArrowRight size={13} /></span>
                </button>
                <button className="sdb-action-card blue" onClick={() => setActiveTab('analytics')}>
                  <div className="sdb-action-icon-wrap"><ChartColumn size={16} /></div>
                  <p className="sdb-action-title">View Analytics</p>
                  <p className="sdb-action-desc">Track performances and subject averages</p>
                  <span className="sdb-action-arrow"><ArrowRight size={13} /></span>
                </button>
                <button className="sdb-action-card green" onClick={() => setActiveTab('courses')}>
                  <div className="sdb-action-icon-wrap"><PlayCircle size={16} /></div>
                  <p className="sdb-action-title">Practice Tests</p>
                  <p className="sdb-action-desc">Take tests and sharpen your skills</p>
                  <span className="sdb-action-arrow"><ArrowRight size={13} /></span>
                </button>
                <button className="sdb-action-card amber" onClick={() => setActiveTab('profile')}>
                  <div className="sdb-action-icon-wrap"><User size={16} /></div>
                  <p className="sdb-action-title">My Profile</p>
                  <p className="sdb-action-desc">View and manage account details</p>
                  <span className="sdb-action-arrow"><ArrowRight size={13} /></span>
                </button>
              </div>
            </div>

            {/* Recent Courses + Upcoming Tests */}
            <div className="sdb-2col">

              {/* Recent Courses */}
              <div className="sdb-card">
                <div className="sdb-section-hd">
                  <span className="sdb-section-title"><BookOpen size={15} /> Recent Courses</span>
                  <button className="sdb-view-all-btn" onClick={() => setActiveTab('courses')}>
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                {courses.length === 0 ? (
                  <div className="sdb-empty">
                    <div className="sdb-empty-icon"><BookOpen size={18} /></div>
                    <p className="sdb-empty-title">No courses yet</p>
                    <p className="sdb-empty-desc">Join a class to access your courses.</p>
                    <button className="sdb-empty-action-btn" onClick={() => setActiveTab('profile')}>Join a Class</button>
                  </div>
                ) : (
                  <div className="sdb-course-list">
                    {courses.slice(0, 4).map((course, i) => {
                      const colors = ['#4F46E5','#3B82F6','#22C55E','#F59E0B']
                      const pct = Math.round(
                        (attempts.records.filter(a => a.courseId === course.id).length /
                        Math.max(1, course.tests?.length ?? 1)) * 100
                      )
                      return (
                        <div key={course.id} className="sdb-course-item">
                          <div className="sdb-course-dot" style={{ background: colors[i % colors.length] }} />
                          <div className="sdb-course-info">
                            <div className="sdb-course-name">{course.name}</div>
                            <div className="sdb-course-sub">{course.tests?.length ?? 0} tests available</div>
                          </div>
                          <div className="sdb-progress-bar-track">
                            <div className="sdb-progress-bar-fill" style={{ width: `${Math.max(2, pct)}%` }} />
                          </div>
                          <button className="sdb-continue-mini-btn" onClick={() => { setActiveTab('courses') }}>
                            Continue
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Tests */}
              <div className="sdb-card">
                <div className="sdb-section-hd">
                  <span className="sdb-section-title"><ClipboardList size={15} /> Upcoming Tests</span>
                </div>
                {courses.length === 0 ? (
                  <div className="sdb-empty">
                    <div className="sdb-empty-icon"><ClipboardList size={18} /></div>
                    <p className="sdb-empty-title">No upcoming tests</p>
                    <p className="sdb-empty-desc">Join a class to see scheduled tests.</p>
                  </div>
                ) : (
                  <div className="sdb-tests-list">
                    {courses.slice(0, 3).flatMap(c =>
                      (c.tests ?? []).slice(0, 2).map(t => ({ course: c, test: t }))
                    ).slice(0, 4).map(({ course, test }) => {
                      const attempted = attempts.records.some(a => a.courseId === course.id && a.testId === test.id)
                      return (
                        <div key={`${course.id}-${test.id}`} className="sdb-test-item">
                          <div className="sdb-test-icon"><FileText size={15} /></div>
                          <div className="sdb-test-info">
                            <div className="sdb-test-name">{test.title}</div>
                            <div className="sdb-test-sub">
                              <span>{course.name}</span>
                            </div>
                          </div>
                          <span className={`sdb-test-badge ${attempted ? 'green' : 'blue'}`}>
                            {attempted ? 'Done' : 'Pending'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity + Learning Progress */}
            <div className="sdb-2col">

              {/* Recent Activity */}
              <div className="sdb-card">
                <div className="sdb-section-hd">
                  <span className="sdb-section-title"><Clock size={15} /> Recent Activity</span>
                  {attempts.records.length > 0 && (
                    <button className="sdb-view-all-btn" onClick={() => setActiveTab('analytics')}>
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                {attempts.records.length === 0 ? (
                  <div className="sdb-empty">
                    <div className="sdb-empty-icon"><Clock size={18} /></div>
                    <p className="sdb-empty-title">No activity yet</p>
                    <p className="sdb-empty-desc">Complete a test to see your activity here.</p>
                  </div>
                ) : (
                  <div className="sdb-activity-list">
                    {attempts.records.slice(0, 5).map((attempt) => {
                      const passed = attempt.percentage >= 60
                      return (
                        <div key={attempt.id} className="sdb-activity-item">
                          <div className={`sdb-activity-dot ${passed ? 'pass' : 'fail'}`} />
                          <div className="sdb-activity-content">
                            <div className="sdb-activity-text">
                              <strong>{attempt.testTitle ?? 'Test'}</strong> — {attempt.subject}
                            </div>
                            <div className="sdb-activity-time">
                              {attempt.submittedAt?.toDate?.().toLocaleDateString('en-IN', { dateStyle: 'medium' }) ?? 'Recent'}
                            </div>
                          </div>
                          <div className={`sdb-activity-score ${passed ? 'pass' : 'fail'}`}>{attempt.percentage}%</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Learning Progress */}
              <div className="sdb-card">
                <div className="sdb-section-hd">
                  <span className="sdb-section-title"><ChartColumn size={15} /> Learning Progress</span>
                </div>
                {subjectAverages.length === 0 ? (
                  <div className="sdb-empty">
                    <div className="sdb-empty-icon"><ChartColumn size={18} /></div>
                    <p className="sdb-empty-title">No data yet</p>
                    <p className="sdb-empty-desc">Complete tests to see subject-wise progress.</p>
                  </div>
                ) : (
                  <div className="sdb-progress-bars">
                    {subjectAverages.map((item) => (
                      <div key={item.subject} className="sdb-progress-row">
                        <div className="sdb-progress-subject">{item.subject}</div>
                        <div className="sdb-progress-track">
                          <div className="sdb-progress-fill" style={{ width: `${Math.round(item.average)}%` }} />
                        </div>
                        <div className="sdb-progress-pct">{Math.round(item.average)}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 2. My Courses Tab */}
        {activeTab === 'courses' && (
          <>
            {/* Level 1: Categories View */}
            {!selectedCategory && (
              <>
                <div className="sdb-page-header">
                  <div>
                    <h1 className="sdb-page-title">Learning Categories</h1>
                    <p className="sdb-page-sub">Select a category to explore topics and activities</p>
                  </div>
                </div>

                <div className="sdb-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  <article className="sdb-course-overview-card indigo-theme" onClick={() => setSelectedCategory('prastuti')}>
                    <div className="sdb-overview-header">
                      <div className="sdb-overview-badges">
                        <span className="sdb-overview-badge primary">2 Subjects</span>
                        <span className="sdb-overview-badge">Classes 8-10</span>
                      </div>
                      <div className="sdb-overview-icon-wrap">
                        <BookOpen />
                      </div>
                    </div>
                    <div className="sdb-overview-body">
                      <h3>
                        Prasthuthi
                        <span className="sdb-overview-arrow"><ArrowRight size={16} /></span>
                      </h3>
                      <p>Comprehensive mathematics and science curriculum for classes 8-10</p>
                    </div>
                  </article>

                  <article className="sdb-course-overview-card orange-theme" onClick={() => setSelectedCategory('anubhav')}>
                    <div className="sdb-overview-header">
                      <div className="sdb-overview-badges">
                        <span className="sdb-overview-badge">Coming Soon</span>
                      </div>
                      <div className="sdb-overview-icon-wrap">
                        <Target />
                      </div>
                    </div>
                    <div className="sdb-overview-body">
                      <h3>
                        Anubhav
                        <span className="sdb-overview-arrow"><ArrowRight size={16} /></span>
                      </h3>
                      <p>Hands-on experiential learning activities through practical exploration</p>
                    </div>
                  </article>

                  <article className="sdb-course-overview-card blue-theme" onClick={() => setSelectedCategory('geomagic')}>
                    <div className="sdb-overview-header">
                      <div className="sdb-overview-badges">
                        <span className="sdb-overview-badge">Coming Soon</span>
                      </div>
                      <div className="sdb-overview-icon-wrap">
                        <School />
                      </div>
                    </div>
                    <div className="sdb-overview-body">
                      <h3>
                        Geomagic
                        <span className="sdb-overview-arrow"><ArrowRight size={16} /></span>
                      </h3>
                      <p>Geometric concepts and visual mathematics through interactive activities</p>
                    </div>
                  </article>
                </div>
              </>
            )}

            {/* Level 2: Class view within selected category */}
            {selectedCategory === 'prastuti' && !selectedClass && (
              <>
                <div className="sdb-breadcrumb-nav">
                  <button onClick={() => setSelectedCategory(null)}>Categories</button>
                  <span>/</span>
                  <span>Prasthuthi</span>
                </div>

                <div className="sdb-page-header">
                  <div>
                    <h1 className="sdb-page-title">Browse Class</h1>
                    <p className="sdb-page-sub">Choose a class to start learning</p>
                  </div>
                  <button className="sdb-quiz-btn-secondary" onClick={() => setSelectedCategory(null)}>
                    Back to Categories
                  </button>
                </div>

                {!joinedClass && !memberships.loading ? (
                  <div className="sdb-state-panel">
                    <div className="sdb-state-icon"><School /></div>
                    <h3>Not Joined Any Class</h3>
                    <p>Please go to the Profile section and join a class using your Class ID to unlock courses.</p>
                    <button className="sdb-empty-action-btn" onClick={() => setActiveTab('profile')}>
                      Go to Profile
                    </button>
                  </div>
                ) : null}

                {joinedClass && (
                  <div className="sdb-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    <article 
                      className="sdb-course-overview-card green-theme" 
                      onClick={() => setSelectedClass(joinedClass.className)}
                    >
                      <div className="sdb-overview-header">
                        <div className="sdb-overview-badges">
                          <span className="sdb-overview-badge primary">Joined</span>
                          <span className="sdb-overview-badge">Active</span>
                        </div>
                        <div className="sdb-overview-icon-wrap">
                          <School />
                        </div>
                      </div>
                      <div className="sdb-overview-body">
                        <h3>
                          {joinedClass.className}
                          <span className="sdb-overview-arrow"><ArrowRight size={16} /></span>
                        </h3>
                        <p>Access your mathematics and science courses, video contents, PDFs, and tests.</p>
                      </div>
                    </article>
                  </div>
                )}
              </>
            )}

            {/* Coming Soon views for unimplemented categories */}
            {(selectedCategory === 'anubhav' || selectedCategory === 'geomagic') && (
              <>
                <div className="sdb-breadcrumb-nav">
                  <button onClick={() => setSelectedCategory(null)}>Categories</button>
                  <span>/</span>
                  <span>{selectedCategory === 'anubhav' ? 'Anubhav' : 'Geomagic'}</span>
                </div>
                <div className="sdb-state-panel">
                  <div className="sdb-state-icon"><Target /></div>
                  <h3>{selectedCategory === 'anubhav' ? 'Anubhav' : 'Geomagic'} is Coming Soon</h3>
                  <p>We are actively working on this learning category. Please check back later!</p>
                  <button className="sdb-empty-action-btn" onClick={() => setSelectedCategory(null)}>
                    Back to Categories
                  </button>
                </div>
              </>
            )}

            {/* Level 3: Subject view for the selected class */}
            {selectedCategory === 'prastuti' && selectedClass && !selectedCourseId && (
              <>
                <div className="sdb-breadcrumb-nav">
                  <button onClick={() => setSelectedCategory(null)}>Categories</button>
                  <span>/</span>
                  <button onClick={() => setSelectedClass(null)}>Prasthuthi</button>
                  <span>/</span>
                  <span>{selectedClass}</span>
                </div>

                <div className="sdb-page-header">
                  <div>
                    <h1 className="sdb-page-title">Browse Subjects</h1>
                    <p className="sdb-page-sub">Choose a subject to explore chapters and tests</p>
                  </div>
                  <button className="sdb-quiz-btn-secondary" onClick={() => setSelectedClass(null)}>
                    Back to Class list
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="sdb-state-panel">
                    <div className="sdb-state-icon"><BookOpen /></div>
                    <h3>No subjects found</h3>
                    <p>Courses for this class are coming soon.</p>
                  </div>
                ) : (
                  <div className="sdb-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {courses.map((course) => {
                      const isScience = course.name.toLowerCase().includes('science')
                      const cardThemeClass = isScience ? 'blue-theme' : 'indigo-theme'
                      const IconComponent = isScience ? FlaskRound : Calculator
                      const badgeLabel = isScience ? '35 Videos' : '43 Videos'
                      const description = isScience 
                        ? 'Scientific experiments and interactive activities' 
                        : 'Mathematical concepts and problem-solving...'
                      
                      return (
                        <article 
                          className={`sdb-course-overview-card ${cardThemeClass}`} 
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id)}
                        >
                          <div className="sdb-overview-header">
                            <div className="sdb-overview-badges">
                              <span className="sdb-overview-badge">3 Classes</span>
                              <span className="sdb-overview-badge">{badgeLabel}</span>
                            </div>
                            <div className="sdb-overview-icon-wrap">
                              <IconComponent />
                            </div>
                          </div>
                          <div className="sdb-overview-body">
                            <h3>
                              {course.name === 'Mathematics' ? 'Maths' : course.name}
                              <span className="sdb-overview-arrow"><ArrowRight size={16} /></span>
                            </h3>
                            <p>{description}</p>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Level 4: Chapter View for the selected course/subject */}
            {selectedCategory === 'prastuti' && selectedClass && selectedCourseId && selectedCourse && (
              <>
                <div className="sdb-breadcrumb-nav">
                  <button onClick={() => setSelectedCategory(null)}>Categories</button>
                  <span>/</span>
                  <button onClick={() => setSelectedClass(null)}>Prasthuthi</button>
                  <span>/</span>
                  <button onClick={() => setSelectedCourseId('')}>{selectedClass}</button>
                  <span>/</span>
                  <span>{selectedCourse.name}</span>
                </div>

                <div className="sdb-page-header">
                  <div>
                    <h1 className="sdb-page-title">{selectedCourse.name}</h1>
                    <p className="sdb-page-sub">{selectedClass} · Course Content</p>
                  </div>
                  <button className="sdb-quiz-btn-secondary" onClick={() => setSelectedCourseId('')}>
                    Back to Subjects
                  </button>
                </div>

                <div className="sdb-tabs">
                  <button 
                    className={`sdb-tab-btn ${activeSubjectTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveSubjectTab('videos')}
                  >
                    Videos
                  </button>
                  <button 
                    className={`sdb-tab-btn ${activeSubjectTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveSubjectTab('materials')}
                  >
                    Study Material
                  </button>
                  <button 
                    className={`sdb-tab-btn ${activeSubjectTab === 'tests' ? 'active' : ''}`}
                    onClick={() => setActiveSubjectTab('tests')}
                  >
                    Tests
                  </button>
                </div>

                {activeSubjectTab === 'videos' && (
                  <div className="sdb-chapter-grid">
                    {selectedCourse.chapters.map((chapter) => (
                      <article className="sdb-chapter-card" key={chapter.id}>
                        <div className="sdb-chapter-card-top video">
                          <div className="sdb-chapter-card-icon">
                            <PlayCircle />
                          </div>
                        </div>
                        <div className="sdb-chapter-card-body">
                          <div className="sdb-chapter-card-info">
                            <span className="sdb-chapter-card-meta">{chapter.title.split(':')[0]}</span>
                            <h4 className="sdb-chapter-card-title">{chapter.videoTitle}</h4>
                          </div>
                          <a 
                            className="sdb-quiz-btn-primary sdb-chapter-card-action" 
                            href={chapter.videoUrl} 
                            rel="noreferrer" 
                            target="_blank"
                            style={{ textDecoration: 'none' }}
                          >
                            <PlayCircle size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Watch Video
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {activeSubjectTab === 'materials' && (
                  <div className="sdb-chapter-grid">
                    {selectedCourse.chapters.map((chapter) => (
                      <article className="sdb-chapter-card" key={chapter.id}>
                        <div className="sdb-chapter-card-top pdf">
                          <div className="sdb-chapter-card-icon">
                            <FileText />
                          </div>
                        </div>
                        <div className="sdb-chapter-card-body">
                          <div className="sdb-chapter-card-info">
                            <span className="sdb-chapter-card-meta">{chapter.title.split(':')[0]}</span>
                            <h4 className="sdb-chapter-card-title">{chapter.pdfTitle}</h4>
                          </div>
                          <a 
                            className="sdb-quiz-btn-primary sdb-chapter-card-action" 
                            href={chapter.pdfUrl} 
                            rel="noreferrer" 
                            target="_blank"
                            style={{ textDecoration: 'none', background: 'var(--sdb-success)' }}
                          >
                            <FileText size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> View PDF
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {activeSubjectTab === 'tests' && (
                  <div className="sdb-chapter-grid">
                    {selectedCourse.tests.map((test) => (
                      <article className="sdb-chapter-card" key={test.id}>
                        <div className="sdb-chapter-card-top test">
                          <div className="sdb-chapter-card-icon">
                            <Award />
                          </div>
                        </div>
                        <div className="sdb-chapter-card-body">
                          <div className="sdb-chapter-card-info">
                            <span className="sdb-chapter-card-meta">{test.chapterRange}</span>
                            <h4 className="sdb-chapter-card-title">{test.title}</h4>
                          </div>
                          <button 
                            className="sdb-quiz-btn-primary sdb-chapter-card-action" 
                            type="button" 
                            onClick={() => startQuiz(selectedCourse, test.id)}
                          >
                            <Clock size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Start Test
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 3. Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Analytics</h1>
                <p className="sdb-page-sub">Performance review and scorecard analysis</p>
              </div>
            </div>

            <div className="sdb-stats-row">
              <div className="sdb-stat-card indigo">
                <div className="sdb-stat-icon"><BarChart3 size={16} /></div>
                <div className="sdb-stat-label">Average Score</div>
                <div className="sdb-stat-value">{averageScore}%</div>
                <div className="sdb-stat-hint">Subject averages</div>
              </div>
              <div className="sdb-stat-card green">
                <div className="sdb-stat-icon"><Award size={16} /></div>
                <div className="sdb-stat-label">Highest Score</div>
                <div className="sdb-stat-value">{highestScore}%</div>
                <div className="sdb-stat-hint">Personal record</div>
              </div>
              <div className="sdb-stat-card amber">
                <div className="sdb-stat-icon"><Target size={16} /></div>
                <div className="sdb-stat-label">Lowest Score</div>
                <div className="sdb-stat-value">{lowestScore}%</div>
                <div className="sdb-stat-hint">Needs improvement</div>
              </div>
              <div className="sdb-stat-card blue">
                <div className="sdb-stat-icon"><Check size={16} /></div>
                <div className="sdb-stat-label">Completion</div>
                <div className="sdb-stat-value">{completionPercentage}%</div>
                <div className="sdb-stat-hint">Courses completed</div>
              </div>
            </div>

            <div className="sdb-2col">
              <div className="sdb-card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Subject-wise Performance</h3>
                <div className="sdb-course-list">
                  {subjectAverages.length ? subjectAverages.map((item) => (
                    <div key={item.subject} className="sdb-course-item" style={{ padding: '8px 0' }}>
                      <div className="sdb-course-info">
                        <div className="sdb-course-name" style={{ fontSize: '0.85rem' }}>{item.subject}</div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sdb-primary)' }}>{Math.round(item.average)}% avg</span>
                    </div>
                  )) : <div className="sdb-empty" style={{ padding: '16px 0' }}>No subject attempts yet.</div>}
                </div>
              </div>
              
              <div className="sdb-card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Recent Test Attempts</h3>
                <div className="sdb-course-list">
                  {attempts.records.length ? attempts.records.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="sdb-course-item" style={{ padding: '8px 0' }}>
                      <div className="sdb-course-info">
                        <div className="sdb-course-name" style={{ fontSize: '0.85rem' }}>{attempt.subject} · {attempt.testTitle}</div>
                        <div className="sdb-course-sub" style={{ fontSize: '0.72rem' }}>Attempt #{attempt.attemptNumber}</div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: attempt.percentage >= 60 ? 'var(--sdb-success)' : 'var(--sdb-danger)' }}>{attempt.percentage}%</span>
                    </div>
                  )) : <div className="sdb-empty" style={{ padding: '16px 0' }}>No attempts submitted yet.</div>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 4. Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Profile</h1>
                <p className="sdb-page-sub">View and manage your account details</p>
              </div>
            </div>

            <div className="sdb-card">
              <div className="sdb-section-hd" style={{ borderBottom: '1px solid var(--sdb-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span className="sdb-section-title"><User size={16} /> Student Information</span>
                {!joinedClass && (
                  <button className="sdb-quiz-btn-primary" type="button" onClick={() => setShowJoinForm((current) => !current)}>
                    <Plus size={14} style={{ marginRight: '6px' }} />
                    Join Class
                  </button>
                )}
              </div>

              <dl className="profile-list learning-profile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>School</dt>
                  <dd style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sdb-text)', margin: 0 }}>{studentProfile.record?.schoolName ?? 'School'}</dd>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>Email</dt>
                  <dd style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sdb-text)', margin: 0 }}>{studentProfile.record?.email ?? userProfile?.email}</dd>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>Status</dt>
                  <dd style={{ margin: 0 }}>
                    <span className="status-badge approved" style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#DCFCE7', color: '#166534' }}>{studentProfile.record?.status ?? 'active'}</span>
                  </dd>
                </div>
                {joinedClass && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <dt style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--sdb-subtle)', letterSpacing: '0.05em' }}>Joined Class ID</dt>
                      <dd style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sdb-text)', margin: 0 }}>{joinedClass.classId}</dd>
                    </div>
                    <div>
                      <dt>Class Section</dt>
                      <dd>{joinedClass.className}</dd>
                    </div>
                    <div>
                      <dt>Classroom Status</dt>
                      <dd>
                        <span className="status-badge approved">joined</span>
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              {showJoinForm && !joinedClass && (
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
              )}
            </div>
          </>
        )}
      </main>
    </div>
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'approvals'>('dashboard')

  return (
    <div className="sdb-school-layout">

      {/* ─── Sidebar Navigation ─── */}
      <aside className="sdb-school-sidebar">
        <div className="sdb-school-sidebar-inner">
          <div className="sdb-school-brand">
            <div className="sdb-school-brand-icon"><School /></div>
            <span className="sdb-school-brand-name">StudyHub</span>
          </div>

          <span className="sdb-school-nav-label">Administration</span>

          <nav className="sdb-school-nav">
            <button
              className={`sdb-school-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} /> Overview
            </button>
            <button
              className={`sdb-school-nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => setActiveTab('teachers')}
            >
              <UserRoundCheck size={16} /> Teachers Directory
            </button>
            <button
              className={`sdb-school-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <UserCheck size={16} /> Approvals Queue
              {pendingTeacherRequests.requests.length > 0 && (
                <span className="sdb-test-badge green" style={{ marginLeft: 'auto' }}>
                  {pendingTeacherRequests.requests.length}
                </span>
              )}
            </button>
          </nav>

          <div className="sdb-school-sidebar-footer">
            <button className="sdb-school-logout-btn" onClick={() => signOut(auth)}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="sdb-school-main">
        {firstError ? <ErrorState message={firstError} /> : null}

        {/* ─── 1. Overview Tab ─── */}
        {activeTab === 'dashboard' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Overview</h1>
                <p className="sdb-page-sub">School statistics and administrative codes</p>
              </div>
            </div>

            {/* Glossy Welcome Card */}
            <div className="sdb-welcome-card glossy">
              <div className="sdb-welcome-left">
                <div className="sdb-avatar">
                  {school?.logoUrl ? (
                    <img alt={`${school.schoolName} logo`} src={school.logoUrl} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    school?.schoolName.charAt(0).toUpperCase() ?? 'S'
                  )}
                </div>
                <div>
                  <p className="sdb-welcome-greeting">School Administrator,</p>
                  <p className="sdb-welcome-name">{school?.schoolName ?? 'School Dashboard'}</p>
                  <div className="sdb-welcome-meta">
                    <span className="sdb-meta-item">
                      <User />
                      <span className="sdb-meta-label">Principal:</span>
                      <span className="sdb-meta-value">{school?.principalName ?? userProfile?.fullName}</span>
                    </span>
                    <span className="sdb-meta-item">
                      <Building2 />
                      <span className="sdb-meta-label">Email:</span>
                      <span className="sdb-meta-value">{school?.email ?? userProfile?.email}</span>
                    </span>
                    <span className="sdb-meta-item">
                      <Check />
                      <span className="sdb-meta-label">Status:</span>
                      <span className="sdb-meta-value" style={{ textTransform: 'capitalize' }}>{school?.status ?? 'approved'}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="sdb-welcome-right" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(79, 70, 229, 0.05)',
                  border: '1px dashed rgba(79, 70, 229, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--sdb-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>School Registration Code</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--sdb-primary)',
                      letterSpacing: '0.02em'
                    }}>
                      {school?.schoolCode ?? 'PENDING'}
                    </span>
                    {school?.schoolCode && (
                      <button 
                        onClick={copySchoolCode}
                        style={{
                          background: 'var(--sdb-primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'background 0.12s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#4338CA')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--sdb-primary)')}
                      >
                        <Clipboard size={10} /> Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="sdb-page-date" style={{ borderLeft: '1px solid var(--sdb-border)', paddingLeft: '16px', height: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span className="sdb-date-day">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
                  </span>
                  <strong style={{ fontSize: '0.8rem' }}>
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="sdb-stats-row">
              <div className="sdb-stat-card indigo">
                <div className="sdb-stat-icon"><UserRoundCheck size={16} /></div>
                <div className="sdb-stat-label">Total Teachers</div>
                <div className="sdb-stat-value">{teachers.count}</div>
                <div className="sdb-stat-hint">Approved instructors</div>
              </div>
              <div className="sdb-stat-card green">
                <div className="sdb-stat-icon"><GraduationCap size={16} /></div>
                <div className="sdb-stat-label">Total Students</div>
                <div className="sdb-stat-value">{students.count}</div>
                <div className="sdb-stat-hint">Registered students</div>
              </div>
              <div className="sdb-stat-card amber">
                <div className="sdb-stat-icon"><School size={16} /></div>
                <div className="sdb-stat-label">Total Classes</div>
                <div className="sdb-stat-value">{classes.count}</div>
                <div className="sdb-stat-hint">Classrooms created</div>
              </div>
              <div className="sdb-stat-card blue">
                <div className="sdb-stat-icon"><BookOpen size={16} /></div>
                <div className="sdb-stat-label">Courses</div>
                <div className="sdb-stat-value">{courses.count}</div>
                <div className="sdb-stat-hint">Syllabus courses</div>
              </div>
            </div>
          </>
        )}

        {/* ─── 2. Teachers Directory Tab ─── */}
        {activeTab === 'teachers' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Teachers Directory</h1>
                <p className="sdb-page-sub">Manage and search registered teachers</p>
              </div>
            </div>

            <div className="sdb-card">
              <div className="sdb-section-hd" style={{ marginBottom: '16px' }}>
                <span className="sdb-section-title"><UserRoundCheck size={16} /> Instructors List</span>
                <div className="tdb-tool-bar">
                  <input
                    className="tdb-select"
                    placeholder="Search teachers..."
                    type="search"
                    style={{ width: '200px' }}
                    value={teacherSearch}
                    onChange={(event) => {
                      setTeacherSearch(event.target.value)
                      setTeacherPage(1)
                    }}
                  />
                  <select
                    className="tdb-select"
                    value={teacherFilter}
                    onChange={(event) => setTeacherFilter(event.target.value as 'all' | 'active')}
                  >
                    <option value="all">All Teachers</option>
                    <option value="active">Active Status</option>
                  </select>
                </div>
              </div>

              {activeTeacherRequests.loading && <SkeletonGrid items={2} />}
              {!activeTeacherRequests.loading && pagedTeachers.length === 0 && (
                <div className="sdb-empty">No teachers found in registry.</div>
              )}

              {!activeTeacherRequests.loading && pagedTeachers.length > 0 && (
                <div className="sdb-school-table-card">
                  <div className="sdb-school-table-row sdb-school-table-header">
                    <div>Teacher Name</div>
                    <div>Subjects</div>
                    <div>Status</div>
                    <div>Joined Date</div>
                    <div>Actions</div>
                  </div>
                  {pagedTeachers.map((teacher) => (
                    <div className="sdb-school-table-row" key={teacher.id}>
                      <div>
                        <span className="sdb-school-table-cell-bold">{teacher.fullName}</span>
                        <span className="sdb-school-table-cell-sub">{teacher.email}</span>
                      </div>
                      <div>{teacher.subjects.length ? teacher.subjects.join(', ') : 'None assigned'}</div>
                      <div>
                        <span className="sdb-test-badge green">Active</span>
                      </div>
                      <div>{formatTimestamp(teacher.joinedDate)}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="sdb-continue-mini-btn" type="button" aria-label="Edit teacher">
                          <Pencil size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit
                        </button>
                        <button className="sdb-continue-mini-btn" type="button" aria-label="Disable teacher">
                          <ToggleLeft size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Disable
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                  <button
                    className="sdb-quiz-btn-secondary"
                    disabled={currentPage === 1}
                    type="button"
                    style={{ minHeight: '30px', padding: '4px 12px' }}
                    onClick={() => setTeacherPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    className="sdb-quiz-btn-secondary"
                    disabled={currentPage === pageCount}
                    type="button"
                    style={{ minHeight: '30px', padding: '4px 12px' }}
                    onClick={() => setTeacherPage((page) => Math.min(pageCount, page + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── 3. Approvals Tab ─── */}
        {activeTab === 'approvals' && (
          <>
            <div className="sdb-page-header">
              <div>
                <h1 className="sdb-page-title">Approval Queue</h1>
                <p className="sdb-page-sub">Approve pending teacher registration requests</p>
              </div>
            </div>

            {pendingTeacherRequests.loading && <SkeletonGrid items={2} />}
            {!pendingTeacherRequests.loading && pendingTeacherRequests.requests.length === 0 && (
              <div className="sdb-card">
                <div className="sdb-empty" style={{ padding: '40px 0' }}>
                  <div className="sdb-empty-icon"><UserCheck size={20} /></div>
                  <p className="sdb-empty-title">Queue is clear</p>
                  <p className="sdb-empty-desc">No pending teacher registration requests.</p>
                </div>
              </div>
            )}

            {!pendingTeacherRequests.loading && pendingTeacherRequests.requests.length > 0 && (
              <div className="sdb-chapter-grid">
                {pendingTeacherRequests.requests.map((request) => (
                  <article className="sdb-chapter-card" key={request.id}>
                    <div className="sdb-chapter-card-top test">
                      <div className="sdb-chapter-card-icon">
                        <UserCheck />
                      </div>
                    </div>
                    <div className="sdb-chapter-card-body">
                      <div className="sdb-chapter-card-info">
                        <span className="sdb-chapter-card-meta">Registration Request</span>
                        <h4 className="sdb-chapter-card-title">{request.fullName}</h4>
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--sdb-muted)' }}>
                          <div style={{ marginBottom: '2px' }}><strong>Email:</strong> {request.email}</div>
                          <div><strong>Requested:</strong> {formatTimestamp(request.requestedDate)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          className="sdb-quiz-btn-primary"
                          type="button"
                          onClick={() => approveTeacher(request.id)}
                          style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', minHeight: '32px' }}
                        >
                          Approve
                        </button>
                        <button
                          className="sdb-quiz-btn-secondary"
                          type="button"
                          onClick={() => rejectTeacher(request.id)}
                          style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', minHeight: '32px', color: 'var(--sdb-danger)', borderColor: '#FECACA' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
