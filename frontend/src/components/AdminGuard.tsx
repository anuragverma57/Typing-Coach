import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminPage } from '../pages/AdminPage'

export function AdminGuard() {
  const { user } = useAuth()

  if (!user?.isAdmin) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <AdminPage />
}
