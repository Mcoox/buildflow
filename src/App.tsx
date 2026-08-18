import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { AuthProvider } from './context/AuthContext'
import { Assets } from './pages/Assets'
import { Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { HR } from './pages/HR'
import { Inventory } from './pages/Inventory'
import { Invoices } from './pages/Invoices'
import { Login } from './pages/Login'
import { Projects } from './pages/Projects'
import { Quotes } from './pages/Quotes'
import { Settings } from './pages/Settings'
import { Suppliers } from './pages/Suppliers'
import { Tutorial } from './pages/Tutorial'
import { Users } from './pages/Users'
import { useStore } from './store/useStore'

function AppRoutes() {
  const store = useStore()

  return (
    <AuthProvider store={store}>
      <Routes>
        <Route path="/login" element={<Login store={store} />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout store={store} />}>
            <Route index element={<Dashboard store={store} />} />
            <Route path="customers" element={<Customers store={store} />} />
            <Route path="quotes" element={<Quotes store={store} />} />
            <Route path="invoices" element={<Invoices store={store} />} />
            <Route path="projects" element={<Projects store={store} />} />
            <Route path="suppliers" element={<Suppliers store={store} />} />
            <Route path="inventory" element={<Inventory store={store} />} />
            <Route path="assets" element={<Assets store={store} />} />
            <Route path="hr" element={<HR store={store} />} />
            <Route path="tutorial" element={<Tutorial store={store} />} />
            <Route path="settings" element={<Settings store={store} />} />
            <Route element={<AdminRoute />}>
              <Route path="users" element={<Users store={store} />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
