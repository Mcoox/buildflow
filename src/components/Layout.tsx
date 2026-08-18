import { NavLink, Outlet } from 'react-router-dom'
import { CompanyLogo } from './CompanyLogo'
import type { Store } from '../store/useStore'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/quotes', label: 'Quotes', icon: '📋' },
  { to: '/invoices', label: 'Invoices', icon: '💰' },
  { to: '/projects', label: 'Projects', icon: '🏗️' },
  { to: '/suppliers', label: 'Suppliers', icon: '🏭' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/assets', label: 'Assets', icon: '🚜' },
  { to: '/hr', label: 'HR', icon: '👷' },
  { to: '/tutorial', label: 'Tutorial', icon: '🎬' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Layout({ store }: { store: Store }) {
  const { company } = store.data

  return (
    <div className="layout">
      <aside className="sidebar">
        <NavLink to="/settings" className="sidebar-brand sidebar-brand-link">
          <CompanyLogo company={company} size="md" />
          <div>
            <span className="brand-name">{company.name}</span>
            <span className="brand-tag">{company.tagline}</span>
          </div>
        </NavLink>
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
          <NavLink to="/settings" className="sidebar-footer-link">
            ⚙️ Company Settings
          </NavLink>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
