import { Bell, Globe2, LogOut, Menu, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import MemberModal from '../ui/MemberModal'
import GlobalSearch from './GlobalSearch'
import './Topbar.css'

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
      <GlobalSearch />
      <div className="topbar-actions">
        <a className="icon-button" href="/" target="_blank" rel="noreferrer" aria-label="Open public website in a new tab" title="Open website in new tab">
          <Globe2 size={18} />
        </a>
        <Link className="icon-button" to="/dashboard/renewals" aria-label="Open renewals" title="Renewals">
          <Bell size={18} />
        </Link>
        <button className="primary-button" type="button" onClick={() => setIsMemberModalOpen(true)}>
          <Plus size={18} />
          <span>New member</span>
        </button>
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
