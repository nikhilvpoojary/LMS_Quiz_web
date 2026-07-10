import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../contexts/authContextValue'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { loading, role, userProfile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="screen-center">
        <div className="loader-card">
          <span className="spinner" />
          <p>Checking admin access...</p>
        </div>
      </main>
    )
  }

  if (!role || !allowedRoles.includes(role) || userProfile?.status !== 'active') {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
