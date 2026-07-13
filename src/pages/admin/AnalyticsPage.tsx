import { Building, CheckCircle2, Clock3, GraduationCap, Users } from 'lucide-react'
import { StatCard } from '../../components/admin/StatCard'
import { ErrorState } from '../../components/common/StateViews'
import { useDashboardStats } from '../../hooks/useDashboardStats'

export function AnalyticsPage() {
  const stats = useDashboardStats()
  const firstError =
    stats.totalSchools.error ??
    stats.pendingSchools.error ??
    stats.approvedSchools.error ??
    stats.students.error ??
    stats.teachers.error

  return (
    <main className="admin-content">
      <div className="page-heading">
        <p className="eyebrow">Realtime Analytics</p>
        <h1>Website Analytics</h1>
      </div>

      {firstError ? <ErrorState message={firstError} /> : null}

      <section className="stats-grid analytics-grid">
        <StatCard
          icon={Building}
          label="Total Schools"
          loading={stats.totalSchools.loading}
          value={stats.totalSchools.count}
        />
        <StatCard
          icon={Clock3}
          label="Pending Schools"
          loading={stats.pendingSchools.loading}
          value={stats.pendingSchools.count}
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved Schools"
          loading={stats.approvedSchools.loading}
          value={stats.approvedSchools.count}
        />
        <StatCard
          icon={GraduationCap}
          label="Students"
          loading={stats.students.loading}
          value={stats.students.count}
        />
        <StatCard
          icon={Users}
          label="Teachers"
          loading={stats.teachers.loading}
          value={stats.teachers.count}
        />
      </section>

      {/* Premium CSS Progress Grids & Telemetry */}
      <section className="analytics-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* User Distribution Card */}
        <div style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>User Base Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
                <span style={{ color: 'var(--sdb-text)' }}>Students</span>
                <span style={{ color: 'var(--sdb-primary)' }}>
                  {stats.students.loading ? '—' : stats.students.count} ({stats.students.count > 0 ? Math.round((stats.students.count / (stats.students.count + stats.teachers.count)) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#EEF2FF', borderRadius: '50px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--sdb-primary)',
                  borderRadius: '50px',
                  width: `${stats.students.count > 0 ? (stats.students.count / (stats.students.count + stats.teachers.count)) * 100 : 0}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
                <span style={{ color: 'var(--sdb-text)' }}>Instructors</span>
                <span style={{ color: '#0284C7' }}>
                  {stats.teachers.loading ? '—' : stats.teachers.count} ({stats.teachers.count > 0 ? Math.round((stats.teachers.count / (stats.students.count + stats.teachers.count)) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#E0F2FE', borderRadius: '50px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#0284C7',
                  borderRadius: '50px',
                  width: `${stats.teachers.count > 0 ? (stats.teachers.count / (stats.students.count + stats.teachers.count)) * 100 : 0}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* School Telemetry Status Card */}
        <div style={{ background: '#fff', border: '1px solid var(--sdb-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--sdb-border)', paddingBottom: '8px' }}>Registration Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
                <span style={{ color: 'var(--sdb-text)' }}>Approved registrations</span>
                <span style={{ color: '#16A34A' }}>
                  {stats.approvedSchools.loading ? '—' : stats.approvedSchools.count} ({stats.totalSchools.count > 0 ? Math.round((stats.approvedSchools.count / stats.totalSchools.count) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#DCFCE7', borderRadius: '50px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#16A34A',
                  borderRadius: '50px',
                  width: `${stats.totalSchools.count > 0 ? (stats.approvedSchools.count / stats.totalSchools.count) * 100 : 0}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
                <span style={{ color: 'var(--sdb-text)' }}>Pending requests queue</span>
                <span style={{ color: '#D97706' }}>
                  {stats.pendingSchools.loading ? '—' : stats.pendingSchools.count} ({stats.totalSchools.count > 0 ? Math.round((stats.pendingSchools.count / stats.totalSchools.count) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#FEF3C7', borderRadius: '50px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#D97706',
                  borderRadius: '50px',
                  width: `${stats.totalSchools.count > 0 ? (stats.pendingSchools.count / stats.totalSchools.count) * 100 : 0}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
