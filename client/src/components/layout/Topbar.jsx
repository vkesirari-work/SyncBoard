import { Globe2, LogOut, Menu, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import MemberModal from '../ui/MemberModal'
import GlobalSearch from './GlobalSearch'
import './Topbar.css'
import NotificationBell from './NotificationBell'

function Topbar({ onOpenNavigation }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SF'

  function logout() {
    if (!window.confirm('Are you sure you want to sign out?')) return
    clearSession()
    navigate('/login', { replace: true })
  }

  function handleMemberCreated() {
    window.dispatchEvent(new Event('member:created'))
    navigate('/dashboard/members')
  }

  return (
    <header className="topbar">
      <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={onOpenNavigation}>
        <Menu size={19} />
      </button>
      {['trainer', 'member', 'staff'].includes(user?.role) ? <div className="trainer-topbar-title"><strong>{user.role === 'member' ? 'Member portal' : user.role === 'trainer' ? 'Trainer workspace' : 'Staff workspace'}</strong><span>{user.role === 'member' ? 'Your private membership' : user.role === 'trainer' ? 'Assigned members only' : `${user.permissions?.length || 0} modules enabled`}</span></div> : <GlobalSearch />}
      <div className="topbar-actions">
        <a className="icon-button" href="/" target="_blank" rel="noreferrer" aria-label="Open public website in a new tab" title="Open website in new tab">
          <Globe2 size={18} />
        </a>
        {!['trainer', 'member'].includes(user?.role) && (user?.role !== 'staff' || user.permissions?.includes('notifications')) && <NotificationBell />}
        {!['trainer', 'member'].includes(user?.role) && (user?.role !== 'staff' || user.permissions?.includes('members')) && <button className="primary-button" type="button" onClick={() => setIsMemberModalOpen(true)}>
          <Plus size={18} />
          <span>New member</span>
        </button>}
        <div className="avatar" aria-label={user ? `Signed in as ${user.name}` : 'Signed in user'} title={user?.name}>
          {initials}
        </div>
        <button className="icon-button" type="button" aria-label="Sign out" title="Sign out" onClick={logout}>
          <LogOut size={18} />
        </button>
      </div>
      {isMemberModalOpen && (
        <MemberModal
          onClose={() => setIsMemberModalOpen(false)}
          onSaved={handleMemberCreated}
        />
      )}
    </header>
  )
}

export default Topbar
