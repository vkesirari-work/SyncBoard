import { useAuthStore } from '../store/useAuthStore'
import Dashboard from './Dashboard'
import TrainerPortal from './TrainerPortal'
import MemberPortal from './MemberPortal'

function DashboardHome() {
  const role = useAuthStore((state) => state.user?.role)
  if (role === 'trainer') return <TrainerPortal />
  if (role === 'member') return <MemberPortal />
  return <Dashboard />
}

export default DashboardHome
