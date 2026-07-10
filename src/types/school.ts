import type { Timestamp } from 'firebase/firestore'

export type SchoolStatus = 'pending' | 'approved' | 'rejected'

export interface School {
  id: string
  schoolName: string
  principalName: string
  email: string
  schoolCode?: string
  schoolId?: string
  logoUrl?: string
  status: SchoolStatus
  createdAt?: Timestamp
  registrationDate?: Timestamp
  rejectionReason?: string
  updatedAt?: Timestamp
}

export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected'

export interface TeacherRequest {
  id: string
  fullName: string
  email: string
  schoolId: string
  schoolName: string
  status: TeacherRequestStatus
  requestedDate?: Timestamp
  joinedDate?: Timestamp
  subjects: string[]
}
