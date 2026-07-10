import { Building2, GraduationCap, School, UserRoundCheck } from 'lucide-react'
import { StatCard } from '../../components/admin/StatCard'
import { ErrorState } from '../../components/common/StateViews'
import { useDashboardStats } from '../../hooks/useDashboardStats'

export function DashboardPage() {
  const stats = useDashboardStats()
  const firstError =
    stats.pendingSchools.error ??
    stats.approvedSchools.error ??
    stats.students.error ??
    stats.teachers.error

  return (
    <main className="admin-content">
      <div className="page-heading">
        <p className="eyebrow">Realtime Overview</p>
        <h1>Dashboard</h1>
      </div>

      {firstError ? <ErrorState message={firstError} /> : null}

      <section className="stats-grid">
        <StatCard
          icon={Building2}
          label="Pending School Requests"
          loading={stats.pendingSchools.loading}
          value={stats.pendingSchools.count}
        />
        <StatCard
          icon={School}
          label="Approved Schools"
          loading={stats.approvedSchools.loading}
          value={stats.approvedSchools.count}
        />
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          loading={stats.students.loading}
          value={stats.students.count}
        />
        <StatCard
          icon={UserRoundCheck}
          label="Total Teachers"
          loading={stats.teachers.loading}
          value={stats.teachers.count}
        />
      </section>
    </main>
  )
}
