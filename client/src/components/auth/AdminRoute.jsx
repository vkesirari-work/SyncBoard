import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

function AdminRoute({ children, permission, ownerOnly = false }) {
  const user = useAuthStore((state) => state.user)
  if (user?.role === 'trainer' || user?.role === 'member') return <Navigate to="/dashboard" replace />
  if (ownerOnly && !['admin', 'user'].includes(user?.role)) return <Navigate to="/dashboard" replace />
  if (user?.role === 'staff' && permission && !user.permissions?.includes(permission)) return <Navigate to="/dashboard" replace />
  return children
}

export default AdminRoute
