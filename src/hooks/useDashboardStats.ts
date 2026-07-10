import { where, type QueryConstraint } from 'firebase/firestore'
import { useMemo } from 'react'
import { useRealtimeCount } from './useRealtimeCount'

export function useDashboardStats() {
  const pendingConstraint = useMemo<QueryConstraint[]>(
    () => [where('status', '==', 'pending')],
    [],
  )
  const approvedConstraint = useMemo<QueryConstraint[]>(
    () => [where('status', '==', 'approved')],
    [],
  )

  const totalSchools = useRealtimeCount('schools')
  const pendingSchools = useRealtimeCount('schools', pendingConstraint)
  const approvedSchools = useRealtimeCount('schools', approvedConstraint)
  const students = useRealtimeCount('students')
  const teachers = useRealtimeCount('teachers')

  return {
    approvedSchools,
    pendingSchools,
    students,
    teachers,
    totalSchools,
  }
}
