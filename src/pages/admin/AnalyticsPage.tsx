import { BarChart3, Building, CheckCircle2, Clock3, GraduationCap, Users } from 'lucide-react'
import { StatCard } from '../../components/admin/StatCard'
import { PageHeader } from '../../components/common/PageHeader'
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
      <PageHeader eyebrow="Realtime Analytics" title="Website Analytics" />

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

      <section className="analytics-panel">
        <div className="analytics-visual">
          <span style={{ height: `${Math.max(stats.totalSchools.count, 1) * 10}px` }} />
          <span style={{ height: `${Math.max(stats.pendingSchools.count, 1) * 10}px` }} />
          <span style={{ height: `${Math.max(stats.approvedSchools.count, 1) * 10}px` }} />
          <span style={{ height: `${Math.max(stats.students.count, 1) * 4}px` }} />
          <span style={{ height: `${Math.max(stats.teachers.count, 1) * 4}px` }} />
        </div>
        <div>
          <BarChart3 aria-hidden="true" />
          <p className="eyebrow">Realtime Snapshot</p>
          <h2>Platform growth overview</h2>
          <p>Counts update directly from the existing realtime dashboard sources.</p>
        </div>
      </section>
    </main>
  )
}
