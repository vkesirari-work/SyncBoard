import { RefreshCw, Search, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '—'
}

function Members() {
  const [members, setMembers] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadMembers = useCallback(async () => {
    setError('')
    try {
      const { data } = await api.get('/members')
      setMembers(data.members)
      setStatus('ready')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load members.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  useEffect(() => {
    const socket = getSocket()
    socket.on('member:created', loadMembers)
    socket.on('member:updated', loadMembers)
    socket.connect()

    return () => {
      socket.off('member:created', loadMembers)
      socket.off('member:updated', loadMembers)
      socket.disconnect()
    }
  }, [loadMembers])

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return members
    return members.filter((member) =>
      [member.name, member.phone, member.email, member.plan?.name, member.status]
        .some((value) => value?.toLowerCase().includes(search)),
    )
  }, [members, query])

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Membership desk</p>
          <h1>Members</h1>
          <p className="page-description">View member contact, plan, status, and membership dates.</p>
        </div>
        <div className="member-total"><Users size={18} /> {members.length} total</div>
      </div>

      <section className="panel">
        <div className="member-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email, or plan" aria-label="Search members" />
          </div>
          <button className="secondary-button" type="button" onClick={loadMembers}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {status === 'error' && <p className="form-error" role="alert">{error}</p>}

        <div className="member-table-wrap">
          <table className="member-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id}>
                  <td><strong>{member.name}</strong><span>{member.email || 'No email'}</span></td>
                  <td>{member.phone}</td>
                  <td>{member.plan?.name || 'No plan'}</td>
                  <td><span className="status-pill">{member.status}</span></td>
                  <td>{formatDate(member.membershipStart)}</td>
                  <td>{formatDate(member.membershipEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status === 'loading' && <p className="empty-state">Loading members…</p>}
        {status === 'ready' && filteredMembers.length === 0 && <p className="empty-state">No matching members found.</p>}
      </section>
    </section>
  )
}

export default Members
