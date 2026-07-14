import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { auth, db } from '../firebase/firebase'
import {
  AuthContext,
  type AuthContextValue,
  type UserProfile,
  type UserRole,
} from './authContextValue'

const validRoles: UserRole[] = [
  'websiteAdmin',
  'school',
  'teacher',
  'student',
]

const isValidRole = (role: unknown): role is UserRole =>
  typeof role === 'string' && validRoles.includes(role as UserRole)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined
    let missingProfileTimer: ReturnType<typeof setTimeout> | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeProfile?.()
      if (missingProfileTimer) {
        clearTimeout(missingProfileTimer)
        missingProfileTimer = undefined
      }
      setUser(currentUser)
      setUserProfile(null)

      if (!currentUser) {
        setLoading(false)
        return
      }

      setAccessDenied(false)
      setLoading(true)
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', currentUser.uid),
        async (snapshot) => {
          const data = snapshot.data()

          if (!snapshot.exists()) {
            if (missingProfileTimer) {
              clearTimeout(missingProfileTimer)
            }
            setAccessDenied(false)
            setUserProfile(null)
            setLoading(true)
            missingProfileTimer = setTimeout(async () => {
              setAccessDenied(true)
              setLoading(false)
              await signOut(auth)
            }, 5000)
            return
          }

          if (missingProfileTimer) {
            clearTimeout(missingProfileTimer)
            missingProfileTimer = undefined
          }

          if (!isValidRole(data?.role)) {
            setAccessDenied(true)
            setUserProfile(null)
            setLoading(false)
            await signOut(auth)
            return
          }

          setUserProfile({
            email: String(data.email ?? currentUser.email ?? ''),
            fullName: String(
              data.fullName ??
                data.displayName ??
                currentUser.displayName ??
                currentUser.email ??
                '',
            ),
            role: data.role,
            schoolCode:
              typeof data.schoolCode === 'string' ? data.schoolCode : undefined,
            schoolId: typeof data.schoolId === 'string' ? data.schoolId : undefined,
            status: data.status === 'pending' || data.status === 'rejected'
              ? data.status
              : 'active',
          })
          setAccessDenied(false)
          setLoading(false)
        },
        async () => {
          setAccessDenied(true)
          setUserProfile(null)
          setLoading(false)
          await signOut(auth)
        },
      )
    })

    return () => {
      if (missingProfileTimer) {
        clearTimeout(missingProfileTimer)
      }
      unsubscribeProfile?.()
      unsubscribeAuth()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessDenied,
      loading,
      role: userProfile?.role ?? null,
      user,
      userProfile,
    }),
    [accessDenied, loading, user, userProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
