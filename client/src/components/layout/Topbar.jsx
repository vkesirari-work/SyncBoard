import { Bell, Globe2, LogOut, Plus, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

function Topbar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
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

  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={18} />
        <input aria-label="Search" placeholder="Search members, plans, payments" />
      </div>
      <div className="topbar-actions">
        <Link className="icon-button" to="/" aria-label="Open public website">
          <Globe2 size={18} />
        </Link>
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="primary-button" type="button">
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
    </header>
  )
}

export default Topbar
