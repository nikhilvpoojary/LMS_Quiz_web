import { BarChart3, Building, CheckCircle2, Clock3, GraduationCap, Users } from 'lucide-react'
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

      <section className="chart-placeholder">
        <div>
          <BarChart3 aria-hidden="true" />
          <h2>Charts area</h2>
          <p>Structured for future chart integration with realtime data.</p>
        </div>
      </section>
    </main>
  )
}
