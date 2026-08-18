import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/quotes', label: 'Quotes', icon: '📋' },
  { to: '/invoices', label: 'Invoices', icon: '💰' },
  { to: '/projects', label: 'Projects', icon: '🏗️' },
  { to: '/hr', label: 'HR', icon: '👷' },
]

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏗️</span>
          <div>
            <span className="brand-name">BuildFlow</span>
            <span className="brand-tag">Construction Management</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>BuildFlow v1.0</span>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
