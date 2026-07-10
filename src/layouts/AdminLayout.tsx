import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'

export function AdminLayout() {
  const { userProfile } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const currentDateTime = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date())
  const roleLabel =
    userProfile?.role === 'websiteAdmin'
      ? 'Website Administrator'
      : (userProfile?.role ?? '').replace(/^\w/, (letter) =>
          letter.toUpperCase(),
        )

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Signed out')
  }

  return (
    <div className={isDark ? 'admin-shell dark-admin' : 'admin-shell'}>
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
          <NavLink to="/admin/approval-requests">
            <Building2 aria-hidden="true" />
            School Approval Requests
          </NavLink>
          <NavLink to="/admin/approved-schools">
            <CheckCircle2 aria-hidden="true" />
            Approved Schools
          </NavLink>
          <NavLink to="/admin/analytics">
            <BarChart3 aria-hidden="true" />
            Website Analytics
          </NavLink>
          <button type="button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Logout
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div className="topbar-profile">
            <p>{currentDateTime}</p>
            <strong>{userProfile?.fullName || userProfile?.email}</strong>
            <span>Role: {roleLabel}</span>
            <span>{userProfile?.email}</span>
          </div>
          <div className="topbar-actions">
            <button aria-label="Notifications" type="button">
              <Bell aria-hidden="true" />
            </button>
            <button
              aria-label="Toggle theme"
              type="button"
              onClick={() => setIsDark((current) => !current)}
            >
              {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <div className="avatar" aria-label="Admin avatar">
              {(userProfile?.fullName || userProfile?.email || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
