import { Bell, Globe2, Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

function Topbar() {
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
        <div className="avatar" aria-label="Signed in user">
          VS
        </div>
      </div>
    </header>
  )
}

export default Topbar
