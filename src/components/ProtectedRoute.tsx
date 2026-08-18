import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}

export function AdminRoute() {
  const { currentUser, isAdmin } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
