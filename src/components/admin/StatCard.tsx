import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  loading: boolean
  value: ReactNode
}

export function StatCard({ icon: Icon, label, loading, value }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon aria-hidden="true" />
      </div>
      <div>
        <p>{label}</p>
        <strong>{loading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}</strong>
      </div>
    </article>
  )
}
