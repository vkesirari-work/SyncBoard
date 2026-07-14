import {
  Bell,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  UserRoundSearch,
  WalletCards,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { projects } from '../../lib/mockData'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Members', icon: Users, to: '/dashboard/members' },
  { label: 'Plans', icon: CreditCard, to: '/dashboard/plans' },
  { label: 'Payments', icon: WalletCards, to: '/dashboard/payments' },
  { label: 'Attendance', icon: CalendarCheck, to: '/dashboard/attendance' },
  { label: 'Leads', icon: UserRoundSearch, to: '/dashboard/leads' },
  { label: 'Renewals', icon: Bell, to: '/dashboard/projects/membership-desk' },
  { label: 'Website', icon: Settings, to: '/' },
]

function Sidebar() {
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

      <div className="project-list">
        <p className="eyebrow">Gym areas</p>
        {projects.map((project) => (
          <NavLink
            className={({ isActive }) => `project-link ${isActive ? 'active' : ''}`}
            key={project.id}
            to={`/dashboard/projects/${project.id}`}
          >
            <Dumbbell size={16} />
            <span>{project.name}</span>
          </NavLink>
        ))}
      </div>

      <button className="ghost-button sidebar-action" type="button">
        <LogOut size={17} />
        <span>Sign out</span>
      </button>
    </aside>
  )
}

export default Sidebar
