import { AlertCircle, Inbox } from 'lucide-react'

export function SkeletonGrid({ items = 4 }: { items?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: items }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <strong />
          <p />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="state-panel">
      <Inbox aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state-panel error">
      <AlertCircle aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
