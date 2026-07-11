import type { ReactNode } from 'react'

interface PageHeaderProps {
  actions?: ReactNode
  eyebrow: string
  title: string
}

export function PageHeader({ actions, eyebrow, title }: PageHeaderProps) {
  return (
    <div className={actions ? 'page-heading split-heading' : 'page-heading'}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {actions}
    </div>
  )
}
