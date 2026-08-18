import type { ReactNode } from 'react'

const colors: Record<string, string> = {
  active: 'badge-green',
  lead: 'badge-blue',
  inactive: 'badge-gray',
  draft: 'badge-gray',
  sent: 'badge-blue',
  accepted: 'badge-green',
  rejected: 'badge-red',
  expired: 'badge-orange',
  paid: 'badge-green',
  overdue: 'badge-red',
  cancelled: 'badge-gray',
  planning: 'badge-blue',
  'in-progress': 'badge-orange',
  'on-hold': 'badge-yellow',
  completed: 'badge-green',
  pending: 'badge-yellow',
  approved: 'badge-green',
  denied: 'badge-red',
  'on-leave': 'badge-orange',
  terminated: 'badge-red',
  vacation: 'badge-blue',
  sick: 'badge-orange',
  personal: 'badge-purple',
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <span className={`badge ${colors[status] ?? 'badge-gray'}`}>{label}</span>
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${accent ?? ''}`}>{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${wide ? 'modal-wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>
}
