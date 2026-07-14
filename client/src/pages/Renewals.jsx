import { CalendarClock, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import './Renewals.css'

function daysUntil(value) {
  return Math.ceil((new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
}

function Renewals() {
  const [members, setMembers] = useState([])
  const [query, setQuery] = useState('')
  const [range, setRange] = useState('30')
  const [error, setError] = useState('')

  const loadMembers = useCallback(async () => {
    try {
      const { data } = await api.get('/members')
      setMembers(data.members.filter((member) => member.membershipEnd))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load renewals.')
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const renewals = useMemo(() => {
    const search = query.trim().toLowerCase()
    const limit = Number(range)
    return members
      .map((member) => ({ ...member, daysRemaining: daysUntil(member.membershipEnd) }))
      .filter((member) => member.daysRemaining <= limit && (!search || [member.name, member.phone, member.email, member.plan?.name].some((value) => value?.toLowerCase().includes(search))))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [members, query, range])

  return <section className="page-stack">
    <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><CalendarClock size={22} /></div><div><p className="eyebrow">Membership desk</p><h1>Renewals</h1><p className="page-description">Track expired and upcoming membership end dates.</p></div></div><div className="member-total"><CalendarClock size={18} /> {renewals.length} due</div></div>
    <div className="payment-summary"><article className="stat-card"><strong>{members.filter((member) => daysUntil(member.membershipEnd) < 0).length}</strong><span>Expired</span></article><article className="stat-card"><strong>{members.filter((member) => { const days = daysUntil(member.membershipEnd); return days >= 0 && days <= 7 }).length}</strong><span>Due in 7 days</span></article><article className="stat-card"><strong>{members.filter((member) => { const days = daysUntil(member.membershipEnd); return days >= 0 && days <= 30 }).length}</strong><span>Due in 30 days</span></article></div>
    <section className="panel"><div className="member-toolbar payment-toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member, phone, or plan" /></div><select className="filter-select" value={range} onChange={(event) => setRange(event.target.value)}><option value="7">Next 7 days + expired</option><option value="30">Next 30 days + expired</option><option value="90">Next 90 days + expired</option><option value="3650">All dated memberships</option></select><button className="secondary-button" type="button" onClick={loadMembers}><RefreshCw size={16} /> Refresh</button></div>{error && <p className="dashboard-notice error" role="alert">{error}</p>}<div className="member-table-wrap"><table className="member-table"><thead><tr><th>Member</th><th>Plan</th><th>End date</th><th>Renewal status</th><th>Member status</th><th>Details</th></tr></thead><tbody>{renewals.map((member) => <tr key={member._id}><td><strong>{member.name}</strong><span>{member.phone}</span></td><td>{member.plan?.name || 'No plan'}</td><td>{new Date(member.membershipEnd).toLocaleDateString('en-IN')}</td><td><span className={`renewal-state ${member.daysRemaining < 0 ? 'overdue' : member.daysRemaining <= 7 ? 'urgent' : ''}`}>{member.daysRemaining < 0 ? `${Math.abs(member.daysRemaining)} days overdue` : member.daysRemaining === 0 ? 'Due today' : `${member.daysRemaining} days left`}</span></td><td><span className="status-pill">{member.status}</span></td><td><Link className="secondary-button compact" to={`/dashboard/members?search=${encodeURIComponent(member.phone)}`}>Open member</Link></td></tr>)}</tbody></table></div>{renewals.length === 0 && <p className="empty-state">No renewals match this range.</p>}</section>
  </section>
}

export default Renewals
