import {
  Bell,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Users,
  UserRoundSearch,
  UserRoundCog,
  WalletCards,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Members', icon: Users, to: '/dashboard/members' },
  { label: 'Plans', icon: CreditCard, to: '/dashboard/plans' },
  { label: 'Payments', icon: WalletCards, to: '/dashboard/payments' },
  { label: 'Attendance', icon: CalendarCheck, to: '/dashboard/attendance' },
  { label: 'Leads', icon: UserRoundSearch, to: '/dashboard/leads' },
  { label: 'Trainers', icon: UserRoundCog, to: '/dashboard/trainers' },
  { label: 'Renewals', icon: Bell, to: '/dashboard/renewals' },
]

function Sidebar() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <strong>Sirari Fitness</strong>
          <span>Admin dashboard</span>
        </div>
      </div>

      <nav className="nav-group" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.label === 'Dashboard'}
            key={item.label}
            to={item.to}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="ghost-button sidebar-action" type="button" onClick={logout}>
        <LogOut size={17} />
        <span>Sign out</span>
      </button>
    </aside>
  )
}

export default Sidebar
