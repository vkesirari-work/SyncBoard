import { useAuthStore } from '../store/useAuthStore'
import Dashboard from './Dashboard'
import TrainerPortal from './TrainerPortal'
import MemberPortal from './MemberPortal'
import StaffWorkspace from './StaffWorkspace'

function DashboardHome() {
  const role = useAuthStore((state) => state.user?.role)
  if (role === 'trainer') return <TrainerPortal />
  if (role === 'member') return <MemberPortal />
  if (role === 'staff') return <StaffWorkspace />
  return <Dashboard />
}

export default DashboardHome
