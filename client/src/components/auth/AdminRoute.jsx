import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

function AdminRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  if (user?.role === 'trainer') return <Navigate to="/dashboard" replace />
  return children
}

export default AdminRoute
