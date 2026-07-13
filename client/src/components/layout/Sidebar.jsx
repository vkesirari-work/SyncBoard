import {
  Bell,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { projects } from '../../lib/mockData'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Members', icon: Users, to: '/' },
  { label: 'Renewals', icon: Bell, to: '/' },
  { label: 'Settings', icon: Settings, to: '/' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">G</div>
        <div>
          <strong>GymDesk</strong>
          <span>Gym management</span>
        </div>
      </div>

      <nav className="nav-group" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.to === '/'}
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
            to={`/projects/${project.id}`}
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
