import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { auth } from '../../firebase/firebase'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function AdminLoginPage() {
  const { accessDenied, loading, role, user, userProfile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (accessDenied) {
      toast.error('Access Denied')
    }
  }, [accessDenied])

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
      toast.success('Checking account access...')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!loading && role && userProfile?.status === 'pending') {
    if ((role === 'school' || role === 'teacher' || role === 'student') && user) {
      return <Navigate replace to={`/approval-waiting/${user.uid}`} />
    }

    return <Navigate replace to="/login" />
  }

  if (!loading && role && userProfile?.status === 'active') {
    const dashboardPath = {
      websiteAdmin: '/admin/dashboard',
      school: '/school/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    }[role]

    return <Navigate replace to={dashboardPath} />
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <Link aria-label="Back to landing page" className="back-link" to="/">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div className="login-heading">
          <span>
            <LockKeyhole aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">StudyHub Login</p>
            <h1>Welcome back.</h1>
            <p className="panel-subtitle">Continue to your approved workspace.</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input
              autoComplete="email"
              placeholder="admin@school.com"
              type="email"
              {...register('email')}
            />
            {errors.email ? <small>{errors.email.message}</small> : null}
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                autoComplete="current-password"
                placeholder="Enter password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password ? <small>{errors.password.message}</small> : null}
          </label>

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="trust-row">
          <ShieldCheck aria-hidden="true" />
          Role-based access is checked before every dashboard opens.
        </div>
      </section>
    </main>
  )
}
