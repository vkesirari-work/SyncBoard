import { useAuthStore } from '../store/useAuthStore'
import Dashboard from './Dashboard'
import TrainerPortal from './TrainerPortal'

function DashboardHome() {
  const role = useAuthStore((state) => state.user?.role)
  return role === 'trainer' ? <TrainerPortal /> : <Dashboard />
}

export default DashboardHome
