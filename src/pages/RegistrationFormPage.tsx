import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  isSecurePassword,
  passwordHelp,
  registerSchool,
  registerStudent,
  registerTeacher,
} from '../services/registration'

type RegistrationType = 'school' | 'teacher' | 'student'

interface FormValues {
  confirmPassword: string
  email: string
  fullName: string
  password: string
  principalName: string
  schoolCode: string
  schoolName: string
}

const initialValues: FormValues = {
  confirmPassword: '',
  email: '',
  fullName: '',
  password: '',
  principalName: '',
  schoolCode: '',
  schoolName: '',
}

const content: Record<RegistrationType, { eyebrow: string; title: string; submit: string }> = {
  school: {
    eyebrow: 'School Registration',
    submit: 'Register School',
    title: 'Submit your school for approval.',
  },
  student: {
    eyebrow: 'Student Registration',
    submit: 'Register Student',
    title: 'Join your school with a code.',
  },
  teacher: {
    eyebrow: 'Teacher Registration',
    submit: 'Request Teacher Access',
    title: 'Request approval from your school.',
  },
}

const isRegistrationType = (value: string | undefined): value is RegistrationType =>
  value === 'school' || value === 'teacher' || value === 'student'

const friendlyError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('auth/email-already-in-use')) {
      return 'This email is already registered.'
    }

    if (error.message.includes('auth/weak-password')) {
      return passwordHelp
    }

    return error.message
  }

  return 'Unable to submit registration.'
}

export function RegistrationFormPage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isRegistrationType(type)) {
    return <Navigate replace to="/register" />
  }

  const updateValue =
    (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
    }

  const validate = () => {
    const required =
      type === 'school'
        ? [values.schoolName, values.principalName, values.email]
        : [values.fullName, values.email, values.schoolCode]

    if (required.some((value) => !value.trim()) || !values.password || !values.confirmPassword) {
      return 'All fields are required.'
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      return 'Enter a valid email address.'
    }

    if (values.password !== values.confirmPassword) {
      return 'Password and Confirm Password must match.'
    }

    if (!isSecurePassword(values.password)) {
      return passwordHelp
    }

    return null
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validate()

    if (validationError) {
      toast.error(validationError)
      return
    }

    setSubmitting(true)

    try {
      if (type === 'school') {
        const schoolId = await registerSchool({
          email: values.email,
          password: values.password,
          principalName: values.principalName,
          schoolName: values.schoolName,
        })
        toast.success('Registration submitted for admin approval.')
        navigate(`/approval-waiting/${schoolId}`, { replace: true })
        return
      }

      if (type === 'teacher') {
        const teacherId = await registerTeacher({
          email: values.email,
          fullName: values.fullName,
          password: values.password,
          schoolCode: values.schoolCode,
        })
        toast.success('Teacher request submitted for school approval.')
        navigate(`/approval-waiting/${teacherId}`, { replace: true })
        return
      }

      const studentId = await registerStudent({
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        schoolCode: values.schoolCode,
      })
      toast.success('Student request submitted for approval.')
      navigate(`/approval-waiting/${studentId}`, { replace: true })
    } catch (error) {
      toast.error(friendlyError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const page = content[type]
  const nameLabel = type === 'school' ? 'Principal Name' : 'Full Name'

  return (
    <main className="login-page">
      <section className="login-panel registration-panel">
        <Link aria-label="Back to register options" className="back-link" to="/register">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div className="page-heading">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          {type === 'school' ? (
            <label>
              School Name *
              <input
                autoComplete="organization"
                placeholder="Royal Public School"
                value={values.schoolName}
                onChange={updateValue('schoolName')}
              />
            </label>
          ) : null}

          <label>
            {nameLabel} *
            <input
              autoComplete="name"
              placeholder={type === 'school' ? 'Principal name' : 'Full name'}
              value={type === 'school' ? values.principalName : values.fullName}
              onChange={updateValue(type === 'school' ? 'principalName' : 'fullName')}
            />
          </label>

          <label>
            {type === 'school' ? 'School Email' : 'Email'} *
            <input
              autoComplete="email"
              placeholder="name@example.com"
              type="email"
              value={values.email}
              onChange={updateValue('email')}
            />
          </label>

          {type !== 'school' ? (
            <label>
              School Code *
              <input
                autoCapitalize="characters"
                placeholder="ROYAL-4821"
                value={values.schoolCode}
                onChange={updateValue('schoolCode')}
              />
            </label>
          ) : null}

          <label>
            Password *
            <div className="password-field">
              <input
                autoComplete="new-password"
                placeholder="At least 8 characters"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={updateValue('password')}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
          </label>

          <label>
            Confirm Password *
            <input
              autoComplete="new-password"
              placeholder="Re-enter password"
              type={showPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              onChange={updateValue('confirmPassword')}
            />
          </label>

          <small>{passwordHelp}</small>

          <button className="primary-button submit-button" disabled={submitting} type="submit">
            {submitting ? (
              <>
                <LoaderCircle aria-hidden="true" />
                Processing...
              </>
            ) : (
              page.submit
            )}
          </button>
        </form>
      </section>
    </main>
  )
}
