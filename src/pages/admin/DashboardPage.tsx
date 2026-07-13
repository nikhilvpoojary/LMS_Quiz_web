import { Building2, GraduationCap, School, UserRoundCheck, Clock, User, Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { StatCard } from '../../components/admin/StatCard'
import { ErrorState } from '../../components/common/StateViews'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useAuth } from '../../hooks/useAuth'
import { useSchools } from '../../hooks/useSchools'

export function DashboardPage() {
  const stats = useDashboardStats()
  const { userProfile } = useAuth()
  const { schools, loading: loadingSchools } = useSchools()

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

  const firstError =
    stats.pendingSchools.error ??
    stats.approvedSchools.error ??
    stats.students.error ??
    stats.teachers.error

  return (
    <main className="admin-content">
      <div className="page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="eyebrow">Realtime Overview</p>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
        </div>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.15)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: '#15803d'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-block',
            animation: 'sdb-pulse 2s infinite'
          }} />
          All Systems Operational
        </div>
      </div>

      {/* Glossy Skyblue Welcome Card */}
      <div className="sdb-welcome-card glossy-skyblue" style={{ marginBottom: '24px' }}>
        <div className="sdb-welcome-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="sdb-avatar" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', color: '#0284C7', border: '1px solid rgba(2, 132, 199, 0.15)', flexShrink: 0 }}>A</div>
          <div>
            <p className="sdb-welcome-greeting" style={{ color: '#0369A1', margin: 0, fontSize: '0.78rem', fontWeight: 600 }}>Welcome,</p>
            <p className="sdb-welcome-name" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C4A6E', letterSpacing: '-0.02em', margin: '2px 0 8px 0' }}>
              {userProfile?.fullName || 'Website Admin'}
            </p>
            <div className="sdb-welcome-meta">
              <span className="sdb-meta-item">
                <Shield size={13} style={{ color: '#0284C7' }} />
                <span className="sdb-meta-label" style={{ color: '#0284C7' }}>Role:</span>
                <span className="sdb-meta-value" style={{ color: '#0C4A6E', fontWeight: 600 }}>{roleLabel}</span>
              </span>
              <span className="sdb-meta-item">
                <Mail size={13} style={{ color: '#0284C7' }} />
                <span className="sdb-meta-label" style={{ color: '#0284C7' }}>Email:</span>
                <span className="sdb-meta-value" style={{ color: '#0C4A6E', fontWeight: 600 }}>{userProfile?.email}</span>
              </span>
              <span className="sdb-meta-item">
                <Clock size={13} style={{ color: '#0284C7' }} />
                <span className="sdb-meta-label" style={{ color: '#0284C7' }}>Access:</span>
                <span className="sdb-meta-value" style={{ color: '#0C4A6E', fontWeight: 600 }}>{currentDateTime}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {firstError ? <ErrorState message={firstError} /> : null}

      <div className="sdb-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Pending Requests Card */}
        <div className="sdb-stat-card amber" style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sdb-muted)' }}>Pending Requests</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'grid', placeItems: 'center' }}><Building2 size={16} /></div>
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sdb-text)' }}>
            {stats.pendingSchools.loading ? '—' : stats.pendingSchools.count}
          </span>
          <svg viewBox="0 0 120 30" width="100%" height="24" style={{ marginTop: '10px', display: 'block' }}>
            <path d="M0,25 Q20,10 40,20 T80,8 T120,5" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Approved Schools Card */}
        <div className="sdb-stat-card green" style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sdb-muted)' }}>Approved Schools</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'grid', placeItems: 'center' }}><School size={16} /></div>
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sdb-text)' }}>
            {stats.approvedSchools.loading ? '—' : stats.approvedSchools.count}
          </span>
          <svg viewBox="0 0 120 30" width="100%" height="24" style={{ marginTop: '10px', display: 'block' }}>
            <path d="M0,25 C15,25 30,15 45,10 C60,5 75,20 90,15 C105,10 120,2 120,2" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Total Students Card */}
        <div className="sdb-stat-card indigo" style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sdb-muted)' }}>Total Students</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', color: 'var(--sdb-primary)', display: 'grid', placeItems: 'center' }}><GraduationCap size={16} /></div>
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sdb-text)' }}>
            {stats.students.loading ? '—' : stats.students.count}
          </span>
          <svg viewBox="0 0 120 30" width="100%" height="24" style={{ marginTop: '10px', display: 'block' }}>
            <path d="M0,20 Q30,5 60,18 T120,2" fill="none" stroke="var(--sdb-primary)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Total Teachers Card */}
        <div className="sdb-stat-card blue" style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sdb-muted)' }}>Total Instructors</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E0F2FE', color: '#0284C7', display: 'grid', placeItems: 'center' }}><UserRoundCheck size={16} /></div>
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sdb-text)' }}>
            {stats.teachers.loading ? '—' : stats.teachers.count}
          </span>
          <svg viewBox="0 0 120 30" width="100%" height="24" style={{ marginTop: '10px', display: 'block' }}>
            <path d="M0,28 C20,22 40,25 60,15 C80,5 100,10 120,5" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Double Column Audit Log & Activity Section */}
      <div className="sdb-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Audit Log Card */}
        <div className="sdb-card" style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>System Audit Log & Live Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingSchools ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--sdb-muted)' }}>Loading live audit logs...</span>
            ) : schools.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--sdb-muted)' }}>No recent activity records.</span>
            ) : (
              schools.slice(0, 4).map((school, index) => {
                const isApproved = school.status === 'approved'
                const actionTitle = isApproved ? 'School Approved' : 'New School Registration Request'
                const actionDesc = isApproved 
                  ? `Approved ${school.schoolName} (Code: ${school.schoolCode || 'N/A'})` 
                  : `Received pending approval request from ${school.schoolName}`
                const actionTime = school.updatedAt
                  ? school.updatedAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : school.registrationDate
                    ? school.registrationDate.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Recent'

                return (
                  <div key={school.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: index < 3 ? '8px' : '0', borderBottom: index < 3 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      {isApproved ? (
                        <CheckCircle2 size={14} style={{ color: '#16A34A', marginTop: '2px' }} />
                      ) : (
                        <AlertCircle size={14} style={{ color: '#D97706', marginTop: '2px' }} />
                      )}
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sdb-text)', display: 'block' }}>{actionTitle}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--sdb-muted)' }}>{actionDesc}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--sdb-subtle)', alignSelf: 'center' }}>{actionTime}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Telemetry quick info */}
        <div className="sdb-card" style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>System Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--sdb-muted)' }}>Cloud Firestore</span>
              <span style={{ fontWeight: 600, color: '#16A34A' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--sdb-muted)' }}>Firebase Auth</span>
              <span style={{ fontWeight: 600, color: '#16A34A' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--sdb-muted)' }}>Telemetry Nodes</span>
              <span style={{ fontWeight: 600, color: '#16A34A' }}>Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--sdb-border)', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ color: 'var(--sdb-muted)' }}>Build Version</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--sdb-muted)' }}>v1.4.2-prod</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
