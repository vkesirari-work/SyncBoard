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
  CalendarClock,
  CalendarOff,
  ShieldCheck,
  Globe2,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import './Sidebar.css'
import { useGymSettings } from '../../hooks/useGymSettings'
import SirariLogo from '../branding/SirariLogo'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', permission: 'dashboard' },
  { label: 'Analytics', icon: BarChart3, to: '/dashboard/analytics', permission: 'analytics' },
  { label: 'Staff & security', icon: ShieldCheck, to: '/dashboard/staff-security', ownerOnly: true },
  { label: 'Members', icon: Users, to: '/dashboard/members', permission: 'members' },
  { label: 'Plans', icon: CreditCard, to: '/dashboard/plans', permission: 'plans' },
  { label: 'Payments', icon: WalletCards, to: '/dashboard/payments', permission: 'payments' },
  { label: 'Attendance', icon: CalendarCheck, to: '/dashboard/attendance', permission: 'attendance' },
  { label: 'Leads', icon: UserRoundSearch, to: '/dashboard/leads', permission: 'leads' },
  { label: 'Trainers', icon: UserRoundCog, to: '/dashboard/trainers', permission: 'trainers' },
  { label: 'Sessions', icon: CalendarClock, to: '/dashboard/sessions', permission: 'sessions' },
  { label: 'Availability', icon: CalendarOff, to: '/dashboard/availability', permission: 'trainers' },
  { label: 'Renewals', icon: Bell, to: '/dashboard/renewals', permission: 'members' },
  { label: 'Notifications', icon: BellRing, to: '/dashboard/notifications', permission: 'notifications' },
  { label: 'Settings', icon: Settings, to: '/dashboard/settings', permission: 'settings' },
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
        {gymSettings.logoUrl ? <img className="brand-logo" src={gymSettings.logoUrl} alt="" /> : <SirariLogo compact size={42} title={gymSettings.gymName} />}
        <div>
          <strong>{gymSettings.gymName}</strong>
          <span>{user?.role === 'trainer' ? 'Trainer workspace' : user?.role === 'member' ? 'Member portal' : user?.role === 'staff' ? 'Staff workspace' : 'Admin dashboard'}</span>
        </div>
        <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}>
          <X size={19} />
        </button>
      </div>

      <nav className="nav-group" aria-label="Primary navigation">
        {(user?.role === 'member'
          ? [
              { label: 'My workspace', icon: LayoutDashboard, to: '/dashboard' },
              { label: 'My progress', icon: BarChart3, to: '/dashboard/progress/me' },
            ]
          : user?.role === 'trainer'
            ? [{ label: 'My workspace', icon: LayoutDashboard, to: '/dashboard' }]
            : navItems.filter((item) => user?.role !== 'staff' || (!item.ownerOnly && user.permissions?.includes(item.permission)))).map((item) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.to === '/dashboard'}
            key={item.label}
            to={item.to}
            onClick={onClose}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <a className="sidebar-website-link" href="/">
        <Globe2 size={17} />
        <span>Open website</span>
      </a>

      <button className="ghost-button sidebar-action" type="button" onClick={logout}>
        <LogOut size={17} />
        <span>Sign out</span>
      </button>
    </aside>
  )
}

export default Sidebar
