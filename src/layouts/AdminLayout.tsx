import {
  BarChart3,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { where, type QueryConstraint } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { auth } from '../firebase/firebase'
import { useRealtimeCount } from '../hooks/useRealtimeCount'
import '../styles/AdminDashboard.css'

export function AdminLayout() {
  const pendingConstraint = useMemo<QueryConstraint[]>(
    () => [where('status', '==', 'pending')],
    [],
  )
  const pendingCount = useRealtimeCount('schools', pendingConstraint)

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Signed out')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/admin/dashboard">
          <span>SH</span>
          <strong>StudyHub</strong>
        </NavLink>
        <nav>
          <NavLink to="/admin/dashboard">
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/approval-requests" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Building2 aria-hidden="true" />
              School Approval Requests
            </span>
            {!pendingCount.loading && pendingCount.count > 0 && (
              <span className="sdb-test-badge green" style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '50px', background: '#FEE2E2', color: '#EF4444', fontWeight: 700 }}>
                {pendingCount.count}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/approved-schools">
            <CheckCircle2 aria-hidden="true" />
            Approved Schools
          </NavLink>
          <NavLink to="/admin/analytics">
            <BarChart3 aria-hidden="true" />
            Website Analytics
          </NavLink>

          <button type="button" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <LogOut aria-hidden="true" />
            Logout
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
