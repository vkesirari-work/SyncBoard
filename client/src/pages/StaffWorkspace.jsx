import { BarChart3, BellRing, CalendarCheck, CalendarClock, CreditCard, LayoutDashboard, Settings, UserRoundCog, UserRoundSearch, Users, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import './StaffWorkspace.css'

const modules = [
  { permission: 'analytics', label: 'Analytics', description: 'View gym reports and trends', icon: BarChart3, to: '/dashboard/analytics' },
  { permission: 'members', label: 'Members', description: 'Manage members and renewals', icon: Users, to: '/dashboard/members' },
  { permission: 'plans', label: 'Plans', description: 'Manage membership plans', icon: CreditCard, to: '/dashboard/plans' },
  { permission: 'payments', label: 'Payments', description: 'Record and review payments', icon: WalletCards, to: '/dashboard/payments' },
  { permission: 'attendance', label: 'Attendance', description: 'Handle check-in and check-out', icon: CalendarCheck, to: '/dashboard/attendance' },
  { permission: 'leads', label: 'Leads', description: 'Follow up sales enquiries', icon: UserRoundSearch, to: '/dashboard/leads' },
  { permission: 'trainers', label: 'Trainers', description: 'Manage trainers and availability', icon: UserRoundCog, to: '/dashboard/trainers' },
  { permission: 'sessions', label: 'Sessions', description: 'Book training sessions', icon: CalendarClock, to: '/dashboard/sessions' },
  { permission: 'notifications', label: 'Notifications', description: 'Review assigned alerts and follow-ups', icon: BellRing, to: '/dashboard/notifications' },
  { permission: 'settings', label: 'Settings', description: 'Update approved gym settings', icon: Settings, to: '/dashboard/settings' },
]

function StaffWorkspace() {
  const user = useAuthStore((state) => state.user)
  const availableModules = modules.filter((module) => user?.permissions?.includes(module.permission))
  return <section className="page-stack staff-workspace">
    <div className="staff-workspace-hero"><div><p className="eyebrow">Staff workspace</p><h1>Welcome, {user?.name?.split(' ')[0]}</h1><p>Open an assigned module to continue today’s work. Owner-level totals and security controls remain private.</p></div><div><LayoutDashboard size={28} /></div></div>
    <section className="panel"><div className="section-title"><div><p className="eyebrow">My access</p><h2>Assigned modules</h2></div><span className="staff-module-count">{availableModules.length} enabled</span></div><div className="staff-module-grid">{availableModules.map((module) => <Link to={module.to} key={module.permission}><span><module.icon size={20} /></span><div><strong>{module.label}</strong><small>{module.description}</small></div></Link>)}</div>{!availableModules.length && <p className="empty-state">No operational modules assigned. Ask the gym owner to update your access.</p>}</section>
  </section>
}

export default StaffWorkspace
