import { Link } from 'react-router-dom'
import { StatusBadge, StatCard } from '../components/ui'
import type { Store } from '../store/useStore'
import { formatCurrency, lineItemsTotal } from '../utils/format'

export function Dashboard({ store }: { store: Store }) {
  const { data } = store

  const activeProjects = data.projects.filter((p) => p.status === 'in-progress').length
  const totalRevenue = data.invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + lineItemsTotal(i.lineItems), 0)
  const outstanding = data.invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + lineItemsTotal(i.lineItems), 0)
  const activeCustomers = data.customers.filter((c) => c.status === 'active').length
  const pendingQuotes = data.quotes.filter((q) => q.status === 'sent' || q.status === 'draft').length
  const activeEmployees = data.employees.filter((e) => e.status === 'active').length
  const pendingTimeOff = data.timeOffRequests.filter((t) => t.status === 'pending').length

  const recentProjects = [...data.projects]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 4)

  const overdueInvoices = data.invoices.filter((i) => i.status === 'overdue')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your construction business</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Active Projects" value={activeProjects} accent="accent-orange" />
        <StatCard label="Revenue Collected" value={formatCurrency(totalRevenue)} accent="accent-green" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} accent="accent-yellow" />
        <StatCard label="Active Customers" value={activeCustomers} />
        <StatCard label="Pending Quotes" value={pendingQuotes} />
        <StatCard label="Team Members" value={activeEmployees} />
      </div>

      {overdueInvoices.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} —
          <Link to="/invoices"> Review now</Link>
        </div>
      )}

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>Active Projects</h2>
            <Link to="/projects" className="link">View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Customer</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => {
                  const customer = data.customers.find((c) => c.id === project.customerId)
                  return (
                    <tr key={project.id}>
                      <td><strong>{project.name}</strong></td>
                      <td>{customer?.company ?? '—'}</td>
                      <td>{formatCurrency(project.budget)}</td>
                      <td><StatusBadge status={project.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <Link to="/customers" className="quick-action">+ New Customer</Link>
            <Link to="/quotes" className="quick-action">+ Create Quote</Link>
            <Link to="/invoices" className="quick-action">+ New Invoice</Link>
            <Link to="/projects" className="quick-action">+ New Project</Link>
          </div>
          {pendingTimeOff > 0 && (
            <div className="card-footer-note">
              <Link to="/hr">📋 {pendingTimeOff} time-off request{pendingTimeOff > 1 ? 's' : ''} pending approval</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
