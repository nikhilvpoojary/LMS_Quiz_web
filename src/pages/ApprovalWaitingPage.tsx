import { doc, onSnapshot } from 'firebase/firestore'
import { CheckCircle2, Clock3, RadioTower } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'

interface WaitingRegistration {
  displayName: string
  heading: string
  message: string
  status: string
}

export function ApprovalWaitingPage() {
  const { schoolId } = useParams()
  const { loading: authLoading, role, user } = useAuth()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState<WaitingRegistration | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!schoolId || authLoading) {
      return undefined
    }

    if (role === 'teacher') {
      const unsubscribeTeacher = onSnapshot(doc(db, 'teacherRequests', schoolId), (snapshot) => {
        if (!snapshot.exists()) {
          setMissing(true)
          return
        }

        const data = snapshot.data()
        const status = String(data.status ?? 'pending')

        setRegistration({
          displayName: String(data.schoolName ?? 'Your school'),
          heading: 'Waiting for School Approval',
          message:
            'Your teacher registration has been submitted successfully. This page will automatically continue once your school admin approves your account.',
          status,
        })

        if (status === 'approved') {
          navigate('/teacher/dashboard', { replace: true })
        }
      })

      return unsubscribeTeacher
    }

    if (role === 'student') {
      const unsubscribeStudent = onSnapshot(doc(db, 'studentRequests', schoolId), (snapshot) => {
        if (!snapshot.exists()) {
          setMissing(true)
          return
        }

        const data = snapshot.data()
        const status = String(data.status ?? 'pending')

        setRegistration({
          displayName: String(data.schoolName ?? 'Your school'),
          heading: 'Waiting for Student Approval',
          message:
            'Your student registration has been submitted successfully. This page will automatically continue once a teacher approves your account.',
          status,
        })

        if (status === 'approved') {
          navigate('/student/dashboard', { replace: true })
        }
      })

      return unsubscribeStudent
    }

    const unsubscribeSchool = onSnapshot(doc(db, 'schools', schoolId), (snapshot) => {
      if (!snapshot.exists()) {
        setMissing(true)
        return
      }

      const data = snapshot.data()
      const status = String(data.status ?? 'pending')

      setRegistration({
        displayName: String(data.schoolName ?? 'Your school'),
        heading: 'Waiting for Administrator Approval',
        message:
          'Your school registration has been submitted successfully. Please wait while the StudyHub Administrator reviews your request. This page will automatically continue once your school is approved.',
        status,
      })

      if (status === 'approved') {
        navigate('/school/dashboard', { replace: true })
      }
    })

    return unsubscribeSchool
  }, [authLoading, navigate, role, schoolId])

  if (!schoolId || missing) {
    return (
      <Navigate
        replace
        to={
          role === 'teacher'
            ? '/register/teacher'
            : role === 'student'
              ? '/register/student'
              : '/register/school'
        }
      />
    )
  }

  if (!authLoading && (role === 'teacher' || role === 'student') && user?.uid !== schoolId) {
    return <Navigate replace to="/login" />
  }

  return (
    <main className="waiting-page">
      <section className="waiting-panel">
        <div className="waiting-logo">
          <span>SH</span>
          <strong>StudyHub</strong>
        </div>
        <div className="waiting-school-mark">
          <Clock3 aria-hidden="true" />
        </div>
        <p className="eyebrow">{registration?.displayName ?? 'Registration received'}</p>
        <h1>Registration Submitted Successfully</h1>
        <h2>{registration?.heading ?? 'Waiting for Approval'}</h2>
        <p>{registration?.message ?? 'This page will automatically continue once approved.'}</p>
        <div className="live-status">
          <RadioTower aria-hidden="true" />
          Listening for realtime approval updates
        </div>
        <div className="waiting-loader" aria-label="Waiting for approval">
          <span />
          <span />
          <span />
        </div>
        {registration?.status === 'rejected' ? (
          <div className="waiting-rejected">
            <CheckCircle2 aria-hidden="true" />
            Registration was reviewed. Please contact StudyHub support for the
            next steps.
          </div>
        ) : null}
      </section>
    </main>
  )
}
