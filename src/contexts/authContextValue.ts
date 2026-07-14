import { createContext } from 'react'
import type { User } from 'firebase/auth'

export type UserRole = 'websiteAdmin' | 'school' | 'teacher' | 'student'
export type UserStatus = 'active' | 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  email: string
  fullName: string
  role: UserRole
  schoolCode?: string
  schoolId?: string
  status: UserStatus
}

export interface AuthContextValue {
  accessDenied: boolean
  loading: boolean
  role: UserRole | null
  user: User | null
  userProfile: UserProfile | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
