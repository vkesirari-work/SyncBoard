import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { projects } from '../../lib/mockData'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Workspace', icon: Users, to: '/' },
  { label: 'Alerts', icon: Bell, to: '/' },
  { label: 'Settings', icon: Settings, to: '/' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <strong>SyncBoard</strong>
          <span>Realtime workspace</span>
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
        <p className="eyebrow">Active projects</p>
        {projects.map((project) => (
          <NavLink
            className={({ isActive }) => `project-link ${isActive ? 'active' : ''}`}
            key={project.id}
            to={`/projects/${project.id}`}
          >
            <FolderKanban size={16} />
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
