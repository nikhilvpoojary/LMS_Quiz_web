import { Activity, Building2, GraduationCap, School, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { StatCard } from '../../components/admin/StatCard'
import { PageHeader } from '../../components/common/PageHeader'
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
      <PageHeader eyebrow="Realtime Overview" title="Dashboard" />

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

      <section className="insight-grid">
        <article className="insight-card">
          <Activity aria-hidden="true" />
          <div>
            <p className="eyebrow">Operations</p>
            <h2>Live request intake</h2>
            <span>Pending schools, approved schools, students, and teachers stay synced from Firebase.</span>
          </div>
        </article>
        <article className="insight-card">
          <ShieldCheck aria-hidden="true" />
          <div>
            <p className="eyebrow">Access</p>
            <h2>Approval gated workspaces</h2>
            <span>Every role reaches the same dashboard routes with the existing protected access flow.</span>
          </div>
        </article>
      </section>
    </main>
  )
}
