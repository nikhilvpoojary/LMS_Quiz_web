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
  Copy,
  FileText,
  GraduationCap,
  LogOut,
  Pencil,
  Plus,
  PlayCircle,
  Search,
  School,
  Target,
  ToggleLeft,
  Trash2,
  UserCheck,
  UserRoundCheck,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
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

  const studentRows: JoinedStudentRow[] = memberships.records.map((membership) => ({
    className: membership.className,
    email: membership.studentEmail ?? 'Not available',
    fullName: membership.studentName ?? 'Student',
    joinedAt: membership.joinedAt,
    lastActivityAt: membership.lastActivityAt,
    membershipId: membership.id,
  }))
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
        <StatCard icon={BarChart3} label="Average Marks" loading={teacherAttempts.loading} value={`${average(teacherAttempts.records.map((attempt) => attempt.percentage))}%`} />
        <StatCard icon={Check} label="Attendance" loading={attendance.loading} value={attendance.count} />
        <StatCard icon={GraduationCap} label="Active Students" loading={memberships.loading} value={new Set(memberships.records.map((membership) => membership.studentId)).size} />
        <StatCard icon={Target} label="Completion" loading={teacherAttempts.loading} value={`${completionPercentage}%`} />
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

      <section className="dashboard-section">
        <div className="page-heading split-heading">
          <div>
            <p className="eyebrow">Learning Analytics</p>
            <h2>Student Performance</h2>
          </div>
          <span className="status-badge approved">{teacherAttempts.records.length} Attempts</span>
        </div>
        {teacherAttempts.loading ? <SkeletonGrid items={2} /> : null}
        {!teacherAttempts.loading && teacherAttempts.records.length === 0 ? (
          <EmptyState message="No test attempts submitted yet." />
        ) : null}
        {teacherAttempts.records.length > 0 ? (
          <div className="learning-analytics-grid">
            <article className="learning-panel">
              <h3>Recent Test Attempts</h3>
              <div className="mini-list">
                {teacherAttempts.records.slice(0, 5).map((attempt) => (
                  <div key={attempt.id}>
                    <strong>{attempt.studentName}</strong>
                    <span>{attempt.subject} · {attempt.testTitle} · {attempt.percentage}%</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="learning-panel">
              <h3>Weak Students</h3>
              <div className="mini-list">
                {(weakStudents.length ? weakStudents : studentPerformanceRows.slice(-3)).map((student) => (
                  <div key={student.studentId}>
                    <strong>{student.studentName}</strong>
                    <span>{student.average}% average · {student.attempts} attempts</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="learning-panel">
              <h3>Strong Students</h3>
              <div className="mini-list">
                {(strongStudents.length ? strongStudents : studentPerformanceRows.slice(0, 3)).map((student) => (
                  <div key={student.studentId}>
                    <strong>{student.studentName}</strong>
                    <span>{student.average}% average · {student.attempts} attempts</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="learning-panel">
              <h3>Subject Performance</h3>
              <div className="mini-list">
                {subjectAverages.map((subject) => (
                  <div key={subject.subject}>
                    <strong>{subject.subject}</strong>
                    <span>{subject.average}% average</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </main>
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
        studentEmail: studentProfile.record?.email ?? userProfile.email,
        studentName: studentProfile.record?.fullName ?? userProfile.fullName,
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

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])

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
      })
      setQuizResult({ ...result, durationSeconds })
      setQuizSession(null)
      toast.success('Test submitted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit test.')
    } finally {
      setSubmittingQuiz(false)
    }
  }, [answers, joinedClass, quizSession, studentProfile.record?.fullName, user?.uid, userProfile])

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
  }

  return (
    <main className="school-dashboard">
      <header className="school-dashboard-header">
        <div className="school-logo large">
          {studentProfile.record?.fullName.charAt(0).toUpperCase() ?? userProfile?.fullName.charAt(0).toUpperCase() ?? 'S'}
        </div>
        <div className="school-dashboard-title">
          <p className="eyebrow">My Dashboard</p>
          <h1>{studentProfile.record?.fullName ?? userProfile?.fullName ?? 'Student'}</h1>
          <dl>
            <div>
              <dt>Student ID</dt>
              <dd>{user?.uid ?? 'Not available'}</dd>
            </div>
            <div>
              <dt>School</dt>
              <dd>{studentProfile.record?.schoolName ?? 'School'}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd>{joinedClass?.className ?? 'Not joined'}</dd>
            </div>
            <div>
              <dt>Joined Class</dt>
              <dd>{joinedClass?.classId ?? 'Not available'}</dd>
            </div>
            <div>
              <dt>Teacher</dt>
              <dd>{joinedClass?.teacherName ?? joinedClass?.teacherId ?? 'Not assigned'}</dd>
            </div>
          </dl>
        </div>
        <button className="secondary-icon-button" type="button" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          Logout
        </button>
      </header>

      {studentProfile.error ?? memberships.error ?? attempts.error ? (
        <ErrorState message={studentProfile.error ?? memberships.error ?? attempts.error ?? 'Unable to load dashboard.'} />
      ) : null}

      <section className="stats-grid">
        <StatCard icon={Target} label="Overall Progress" loading={attempts.loading} value={`${completionPercentage}%`} />
        <StatCard icon={BookOpen} label="Tests Completed" loading={attempts.loading} value={new Set(attempts.records.map((attempt) => `${attempt.courseId}_${attempt.testId}`)).size} />
        <StatCard icon={BarChart3} label="Average Score" loading={attempts.loading} value={`${averageScore}%`} />
        <StatCard icon={Check} label="Attendance" loading={false} value="Future" />
      </section>

      <section className="dashboard-section">
        <div className="page-heading split-heading">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Student Information</h2>
          </div>
          <button className="secondary-icon-button" type="button" onClick={() => setShowJoinForm((current) => !current)}>
            <Plus aria-hidden="true" />
            Join Class
          </button>
        </div>
        <dl className="profile-list learning-profile">
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

      <section className="dashboard-section">
        <div className="page-heading">
          <p className="eyebrow">My Courses</p>
          <h2>{joinedClass?.className ?? 'Join a class to see courses'}</h2>
        </div>
        {!joinedClass && !memberships.loading ? <EmptyState message="Join a class with your Class ID to unlock courses." /> : null}
        {joinedClass && courses.length === 0 ? <EmptyState message="Courses for this class are coming soon." /> : null}
        {courses.length > 0 ? (
          <div className="course-grid">
            {courses.map((course) => (
              <button
                className={course.id === selectedCourse?.id ? 'course-card active' : 'course-card'}
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
              >
                <BookOpen aria-hidden="true" />
                <strong>{course.name}</strong>
                <span>{course.chapters.length} chapters · {course.tests.length} tests</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {selectedCourse ? (
        <section className="dashboard-section">
          <div className="page-heading split-heading">
            <div>
              <p className="eyebrow">Subject Page</p>
              <h2>{selectedCourse.name}</h2>
            </div>
            <span className="status-badge approved">Study Materials</span>
          </div>
          <div className="chapter-grid">
            {selectedCourse.chapters.map((chapter) => (
              <article className="learning-panel" key={chapter.id}>
                <h3>{chapter.title}</h3>
                <div className="learning-actions">
                  <a href={chapter.videoUrl} rel="noreferrer" target="_blank">
                    <PlayCircle aria-hidden="true" />
                    Video
                  </a>
                  <a href={chapter.pdfUrl} rel="noreferrer" target="_blank">
                    <FileText aria-hidden="true" />
                    PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="test-grid">
            {selectedCourse.tests.map((test) => (
              <article className="learning-panel" key={test.id}>
                <h3>{test.title}</h3>
                <p>{test.chapterRange}</p>
                <button className="primary-button icon-button" type="button" onClick={() => startQuiz(selectedCourse, test.id)}>
                  <Clock aria-hidden="true" />
                  Start 5 min test
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {quizSession && currentQuestion ? (
        <section className="dashboard-section quiz-section">
          <div className="page-heading split-heading">
            <div>
              <p className="eyebrow">{quizSession.course.name}</p>
              <h2>{getTestById(quizSession.course, quizSession.testId)?.title ?? 'Practice Test'}</h2>
            </div>
            <span className="timer-badge">{formatDuration(remainingSeconds)}</span>
          </div>
          <div className="question-nav">
            {preparedQuestions.map((question, index) => {
              const isAnswered = Boolean(answers[question.id])
              const isVisited = visitedQuestionIds.has(question.id)
              const statusClass = isAnswered ? 'answered' : isVisited ? 'unanswered' : 'not-visited'

              return (
                <button
                  className={`${statusClass} ${index === currentQuestionIndex ? 'active' : ''}`}
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <article className="quiz-card">
            <strong>Question {currentQuestionIndex + 1}</strong>
            <h3>{currentQuestion.prompt}</h3>
            <div className="option-grid">
              {currentQuestion.options.map((option) => (
                <button
                  className={answers[currentQuestion.id] === option ? 'selected' : ''}
                  key={option}
                  type="button"
                  onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
          <div className="quiz-controls">
            <button
              className="secondary-icon-button"
              disabled={currentQuestionIndex === 0}
              type="button"
              onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
            >
              Previous
            </button>
            <button
              className="secondary-icon-button"
              disabled={currentQuestionIndex === preparedQuestions.length - 1}
              type="button"
              onClick={() => setCurrentQuestionIndex((index) => Math.min(preparedQuestions.length - 1, index + 1))}
            >
              Next
            </button>
            <button className="primary-button" disabled={submittingQuiz} type="button" onClick={() => void finishQuiz()}>
              {submittingQuiz ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </section>
      ) : null}

      {quizResult ? (
        <section className="dashboard-section">
          <div className="page-heading">
            <p className="eyebrow">Submission</p>
            <h2>Test Result</h2>
          </div>
          <div className="stats-grid">
            <StatCard icon={Award} label="Score" loading={false} value={`${quizResult.score}/10`} />
            <StatCard icon={Check} label="Correct" loading={false} value={quizResult.correct} />
            <StatCard icon={X} label="Wrong" loading={false} value={quizResult.wrong} />
            <StatCard icon={Clock} label="Time Taken" loading={false} value={formatDuration(quizResult.durationSeconds)} />
          </div>
          <strong className="result-percentage">{quizResult.percentage}%</strong>
        </section>
      ) : null}

      <section className="dashboard-section">
        <div className="page-heading">
          <p className="eyebrow">Student Analytics</p>
          <h2>Performance</h2>
        </div>
        <div className="stats-grid">
          <StatCard icon={BarChart3} label="Average Score" loading={attempts.loading} value={`${averageScore}%`} />
          <StatCard icon={Award} label="Highest Score" loading={attempts.loading} value={`${highestScore}%`} />
          <StatCard icon={Target} label="Lowest Score" loading={attempts.loading} value={`${lowestScore}%`} />
          <StatCard icon={Check} label="Completion" loading={attempts.loading} value={`${completionPercentage}%`} />
        </div>
        <div className="learning-analytics-grid">
          <article className="learning-panel">
            <h3>Subject-wise Performance</h3>
            <div className="mini-list">
              {subjectAverages.length ? subjectAverages.map((subject) => (
                <div key={subject.subject}>
                  <strong>{subject.subject}</strong>
                  <span>{subject.average}% average</span>
                </div>
              )) : <span>No subject attempts yet.</span>}
            </div>
          </article>
          <article className="learning-panel">
            <h3>Recent Attempts</h3>
            <div className="mini-list">
              {attempts.records.length ? attempts.records.slice(0, 5).map((attempt) => (
                <div key={attempt.id}>
                  <strong>{attempt.subject} · {attempt.testTitle}</strong>
                  <span>{attempt.percentage}% · Attempt {attempt.attemptNumber}</span>
                </div>
              )) : <span>No attempts submitted yet.</span>}
            </div>
          </article>
        </div>
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
