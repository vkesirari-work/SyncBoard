import { Pencil, RefreshCw, Search, Trash2, TrendingUp, Users } from 'lucide-react'
import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import MemberModal from '../components/ui/MemberModal'
import Pagination from '../components/ui/Pagination'
import { useServerPagination } from '../hooks/usePagination'
import { Link, useSearchParams } from 'react-router-dom'
import './Members.css'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '—'
}

function Members() {
  const [searchParams] = useSearchParams()
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState(() => searchParams.get('search') || '')
  const deferredQuery = useDeferredValue(query)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const memberPagination = useServerPagination(total, { resetKey: deferredQuery })

  const loadMembers = useCallback(async () => {
    setError('')
    try {
      const { data } = await api.get('/members', { params: { page: memberPagination.page, limit: memberPagination.pageSize, q: deferredQuery || undefined } })
      setMembers(data.members)
      setTotal(data.pagination?.total ?? data.members.length)
      setStatus('ready')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load members.')
      setStatus('error')
    }
  }, [deferredQuery, memberPagination.page, memberPagination.pageSize])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const socket = getSocket()
    socket.on('member:created', loadMembers)
    socket.on('member:updated', loadMembers)
    socket.on('member:deleted', loadMembers)
    return () => {
      socket.off('member:created', loadMembers)
      socket.off('member:updated', loadMembers)
      socket.off('member:deleted', loadMembers)
    }
  }, [loadMembers])

  async function deleteMember(member) {
    if (!window.confirm(`Delete ${member.name}? This cannot be undone.`)) return
    setDeletingId(member._id)
    setError('')
    try {
      await api.delete(`/members/${member._id}`)
      await loadMembers()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete member.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="page-title-row"><div className="page-title-icon"><Users size={22} /></div><div><p className="eyebrow">Membership desk</p><h1>Members</h1><p className="page-description">View member contact, plan, status, and membership dates.</p></div></div>
        <div className="member-total"><Users size={18} /> {total} total</div>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td data-label="Member"><strong>{member.name}</strong><span>{member.email || 'No email'}</span>{member.hasLogin && <small className="member-login-state">Portal enabled</small>}</td>
                  <td data-label="Phone">{member.phone}</td>
                  <td data-label="Plan">{member.plan?.name || 'No plan'}</td>
                  <td data-label="Status"><span className="status-pill">{member.status}</span></td>
                  <td data-label="Start">{formatDate(member.membershipStart)}</td>
                  <td data-label="End">{formatDate(member.membershipEnd)}</td>
                  <td data-label="Actions">
                    <div className="table-actions">
                      <Link className="secondary-button compact" to={`/dashboard/progress/${member._id}`} title={`Open ${member.name}'s progress`}><TrendingUp size={14} /> Progress</Link>
                      <button className="secondary-button compact" type="button" aria-label={`Edit ${member.name}`} title="Edit member" onClick={() => setSelectedMember(member)}><Pencil size={14} /> Edit</button>
                      <button className="icon-button small danger" type="button" aria-label={`Delete ${member.name}`} title="Delete" disabled={deletingId === member._id} onClick={() => deleteMember(member)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={memberPagination} label="members" />

        {status === 'loading' && <p className="empty-state">Loading members…</p>}
        {status === 'ready' && members.length === 0 && <p className="empty-state">No matching members found.</p>}
      </section>
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSaved={() => {
            setSelectedMember(null)
            loadMembers()
          }}
        />
      )}
    </section>
  )
}

export default Members
