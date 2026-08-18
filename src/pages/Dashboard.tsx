import { Link } from 'react-router-dom'
import { CompanyLogo } from '../components/CompanyLogo'
import { StatusBadge, StatCard } from '../components/ui'
import type { Store } from '../store/useStore'
import { formatCurrency, lineItemsTotal } from '../utils/format'

export function Dashboard({ store }: { store: Store }) {
  const { data } = store
  const { company } = data

  const activeProjects = data.projects.filter((p) => p.status === 'in-progress').length
  const totalRevenue = data.invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + lineItemsTotal(i.lineItems), 0)
  const outstanding = data.invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + lineItemsTotal(i.lineItems), 0)
  const activeCustomers = data.customers.filter((c) => c.status === 'active').length
  const activeEmployees = data.employees.filter((e) => e.status === 'active').length
  const pendingTimeOff = data.timeOffRequests.filter((t) => t.status === 'pending').length
  const lowStock = data.inventory.filter((i) => i.quantity <= i.reorderLevel).length
  const assetsInUse = data.assets.filter((a) => a.status === 'in-use').length
  const activeSuppliers = data.suppliers.filter((s) => s.status === 'active').length

  const recentProjects = [...data.projects]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 4)

  const overdueInvoices = data.invoices.filter((i) => i.status === 'overdue')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">{company.name} — business overview (ZAR)</p>
        </div>
      </div>

      <div className="company-banner card">
        <CompanyLogo company={company} size="lg" />
        <div className="company-banner-info">
          <h2>{company.legalName}</h2>
          {company.tagline && <p className="company-tagline">{company.tagline}</p>}
          <p>{company.address}</p>
          <p className="text-muted">
            Reg: {company.registration} · VAT: {company.vatNumber} · {company.email} · {company.phone}
          </p>
          {company.website && (
            <p className="text-muted">
              <a href={company.website} target="_blank" rel="noreferrer" className="company-website-link">
                {company.website}
              </a>
            </p>
          )}
        </div>
        <Link to="/settings" className="btn-sm company-edit-link">Edit</Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Active Projects" value={activeProjects} accent="accent-orange" />
        <StatCard label="Revenue Collected" value={formatCurrency(totalRevenue)} accent="accent-green" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} accent="accent-yellow" />
        <StatCard label="Active Customers" value={activeCustomers} />
        <StatCard label="Low Stock Items" value={lowStock} accent="accent-yellow" />
        <StatCard label="Assets In Use" value={assetsInUse} />
        <StatCard label="Active Suppliers" value={activeSuppliers} />
        <StatCard label="Team Members" value={activeEmployees} />
      </div>

      {overdueInvoices.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} —
          <Link to="/invoices"> Review now</Link>
        </div>
      )}

      {lowStock > 0 && (
        <div className="alert alert-warning">
          📦 {lowStock} inventory item{lowStock > 1 ? 's' : ''} below reorder level —
          <Link to="/inventory"> Check stock</Link>
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
            <Link to="/suppliers" className="quick-action">+ Add Supplier</Link>
            <Link to="/inventory" className="quick-action">+ Stock Item</Link>
            <Link to="/assets" className="quick-action">+ Register Asset</Link>
            <Link to="/tutorial" className="quick-action">🎬 Watch Tutorial</Link>
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
