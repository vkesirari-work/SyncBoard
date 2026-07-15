import {
  Bell,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  X,
  Users,
  UserRoundSearch,
  UserRoundCog,
  WalletCards,
  Settings,
  BellRing,
  BarChart3,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import './Sidebar.css'
import { useGymSettings } from '../../hooks/useGymSettings'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Analytics', icon: BarChart3, to: '/dashboard/analytics' },
  { label: 'Members', icon: Users, to: '/dashboard/members' },
  { label: 'Plans', icon: CreditCard, to: '/dashboard/plans' },
  { label: 'Payments', icon: WalletCards, to: '/dashboard/payments' },
  { label: 'Attendance', icon: CalendarCheck, to: '/dashboard/attendance' },
  { label: 'Leads', icon: UserRoundSearch, to: '/dashboard/leads' },
  { label: 'Trainers', icon: UserRoundCog, to: '/dashboard/trainers' },
  { label: 'Renewals', icon: Bell, to: '/dashboard/renewals' },
  { label: 'Notifications', icon: BellRing, to: '/dashboard/notifications' },
  { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
]

function Sidebar({ isOpen, onClose }) {
  const gymSettings = useGymSettings()
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)

  function logout() {
    if (!window.confirm('Are you sure you want to sign out?')) return
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="brand">
        {gymSettings.logoUrl ? <img className="brand-logo" src={gymSettings.logoUrl} alt="" /> : <div className="brand-mark">{gymSettings.gymName.slice(0, 1).toUpperCase()}</div>}
        <div>
          <strong>{gymSettings.gymName}</strong>
          <span>{user?.role === 'trainer' ? 'Trainer workspace' : user?.role === 'member' ? 'Member portal' : 'Admin dashboard'}</span>
        </div>
        <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}>
          <X size={19} />
        </button>
      </div>

      <nav className="nav-group" aria-label="Primary navigation">
        {(['trainer', 'member'].includes(user?.role) ? [{ label: 'My workspace', icon: LayoutDashboard, to: '/dashboard' }] : navItems).map((item) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.label === 'Dashboard'}
            key={item.label}
            to={item.to}
            onClick={onClose}
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
