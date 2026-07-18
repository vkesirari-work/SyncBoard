import { CalendarClock, CheckCircle2, Clock3, Pencil, Plus, RefreshCw, Search, Trash2, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ModalShell from '../components/ui/ModalShell'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import './TrainingSessions.css'

function nextSessionTime() {
  const date = new Date(Date.now() + 3600000)
  date.setMinutes(0, 0, 0)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const initialForm = { member: '', trainer: '', scheduledAt: nextSessionTime(), durationMinutes: '60', status: 'scheduled', focus: '', adminNotes: '' }

function toDateTimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function TrainingSessions() {
  const [sessions, setSessions] = useState([])
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSession, setSelectedSession] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [sessionResponse, memberResponse, trainerResponse] = await Promise.all([api.get('/training-sessions'), api.get('/members'), api.get('/trainers')])
      setSessions(sessionResponse.data.sessions)
      setMembers(memberResponse.data.members)
      setTrainers(trainerResponse.data.trainers)
      setError('')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not load training sessions.') }
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const socket = getSocket()
    const events = ['training-session:created', 'training-session:updated', 'training-session:deleted']
    events.forEach((event) => socket.on(event, loadData))
    return () => { events.forEach((event) => socket.off(event, loadData)) }
  }, [loadData])

  const availableTrainers = useMemo(() => trainers.filter((trainer) => trainer.isActive && (!form.member || trainer.assignedMembers.some((member) => member._id === form.member))), [trainers, form.member])
  const filteredSessions = useMemo(() => {
    const search = query.trim().toLowerCase()
    const now = Date.now()
    return sessions.filter((session) => (statusFilter === 'all' || session.status === statusFilter) && (!search || [session.member?.name, session.member?.phone, session.trainer?.name, session.focus, session.status].some((value) => value?.toLowerCase().includes(search)))).sort((a, b) => {
      const aUpcoming = a.status === 'scheduled' && new Date(a.scheduledAt).getTime() >= now
      const bUpcoming = b.status === 'scheduled' && new Date(b.scheduledAt).getTime() >= now
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
      return aUpcoming ? new Date(a.scheduledAt) - new Date(b.scheduledAt) : new Date(b.scheduledAt) - new Date(a.scheduledAt)
    })
  }, [sessions, query, statusFilter])

  const counts = useMemo(() => ({ upcoming: sessions.filter((session) => session.status === 'scheduled' && new Date(session.scheduledAt) >= new Date()).length, completed: sessions.filter((session) => session.status === 'completed').length, today: sessions.filter((session) => new Date(session.scheduledAt).toDateString() === new Date().toDateString() && session.status !== 'cancelled').length }), [sessions])

  function openCreate() { setSelectedSession(null); setForm({ ...initialForm, scheduledAt: nextSessionTime() }); setError(''); setIsFormOpen(true) }
  function openEdit(session) { setSelectedSession(session); setForm({ member: session.member?._id || '', trainer: session.trainer?._id || '', scheduledAt: toDateTimeInput(session.scheduledAt), durationMinutes: String(session.durationMinutes), status: session.status, focus: session.focus || '', adminNotes: session.adminNotes || '' }); setError(''); setIsFormOpen(true) }
  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value, ...(name === 'member' ? { trainer: '' } : {}) }))
  }
  async function saveSession(event) {
    event.preventDefault(); setIsSubmitting(true); setError('')
    try {
      const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString(), durationMinutes: Number(form.durationMinutes) }
      if (selectedSession) await api.patch(`/training-sessions/${selectedSession._id}`, payload)
      else await api.post('/training-sessions', payload)
      setIsFormOpen(false); await loadData()
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not save training session.') }
    finally { setIsSubmitting(false) }
  }
  async function updateStatus(session, status) {
    setError('')
    try { await api.patch(`/training-sessions/${session._id}`, { status }); await loadData() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not update session.') }
  }
  async function deleteSession(session) {
    if (!window.confirm(`Delete session for ${session.member?.name}?`)) return
    try { await api.delete(`/training-sessions/${session._id}`); await loadData() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not delete session.') }
  }

  return <section className="page-stack training-sessions-page">
    <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><CalendarClock size={22} /></div><div><p className="eyebrow">Coaching operations</p><h1>Training sessions</h1><p className="page-description">Book trainer time, prevent schedule conflicts, and track completed sessions.</p></div></div><button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> Book session</button></div>
    <div className="session-summary"><article><CalendarClock size={19} /><strong>{counts.today}</strong><span>Sessions today</span></article><article><Clock3 size={19} /><strong>{counts.upcoming}</strong><span>Upcoming</span></article><article><CheckCircle2 size={19} /><strong>{counts.completed}</strong><span>Completed</span></article></div>
    <section className="panel"><div className="member-toolbar session-toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member, trainer, focus, or status" /></div><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select><button className="secondary-button" type="button" onClick={loadData}><RefreshCw size={16} /> Refresh</button></div>{error && <p className="dashboard-notice error" role="alert">{error}</p>}<div className="member-table-wrap"><table className="member-table session-table"><thead><tr><th>Date & time</th><th>Member</th><th>Trainer</th><th>Focus</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredSessions.map((session) => <tr key={session._id}><td data-label="Date & time"><strong>{new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong><span>{new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></td><td data-label="Member"><strong>{session.member?.name || 'Removed member'}</strong><span>{session.member?.phone}</span></td><td data-label="Trainer"><strong>{session.trainer?.name || 'Removed trainer'}</strong><span className="capitalize">{session.trainer?.shift?.replaceAll('_', ' ')}</span></td><td data-label="Focus">{session.focus || 'General training'}</td><td data-label="Duration">{session.durationMinutes} min</td><td data-label="Status"><span className={`session-status ${session.status}`}>{session.status.replaceAll('_', ' ')}</span></td><td data-label="Actions"><div className="table-actions"><button className="icon-button small" type="button" title="Edit" aria-label={`Edit session for ${session.member?.name}`} onClick={() => openEdit(session)}><Pencil size={15} /></button>{session.status === 'scheduled' && <><button className="icon-button small session-complete" type="button" title="Mark completed" aria-label={`Complete session for ${session.member?.name}`} onClick={() => updateStatus(session, 'completed')}><CheckCircle2 size={15} /></button><button className="icon-button small danger" type="button" title="Cancel session" aria-label={`Cancel session for ${session.member?.name}`} onClick={() => updateStatus(session, 'cancelled')}><XCircle size={15} /></button></>}<button className="icon-button small danger" type="button" title="Delete" aria-label={`Delete session for ${session.member?.name}`} onClick={() => deleteSession(session)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{!filteredSessions.length && <p className="empty-state">No training sessions match these filters.</p>}</section>
    {isFormOpen && <ModalShell className="modal-card-wide session-modal" labelledBy="session-modal-title" isBusy={isSubmitting} onClose={() => setIsFormOpen(false)}><div className="modal-header"><div><p className="eyebrow">Trainer calendar</p><h2 id="session-modal-title">{selectedSession ? 'Edit training session' : 'Book training session'}</h2></div><button className="icon-button" type="button" onClick={() => setIsFormOpen(false)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveSession}><div className="form-grid equal"><label>Member<select name="member" value={form.member} onChange={updateField} required><option value="">Select member</option>{members.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.phone}</option>)}</select></label><label>Assigned trainer<select name="trainer" value={form.trainer} onChange={updateField} required disabled={!form.member}><option value="">{form.member ? availableTrainers.length ? 'Select trainer' : 'No assigned trainer' : 'Select member first'}</option>{availableTrainers.map((trainer) => <option key={trainer._id} value={trainer._id}>{trainer.name} · {trainer.shift.replaceAll('_', ' ')}</option>)}</select></label></div>{form.member && !availableTrainers.length && <p className="session-assignment-note">Assign this member from the Trainers tab before booking.</p>}<div className="form-grid equal"><label>Date & time<input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={updateField} required /></label><label>Duration<select name="durationMinutes" value={form.durationMinutes} onChange={updateField}><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option></select></label></div><label>Training focus<input name="focus" value={form.focus} onChange={updateField} placeholder="Strength, mobility, assessment…" /></label>{selectedSession && <label>Status<select name="status" value={form.status} onChange={updateField}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select></label>}<label>Admin notes<textarea name="adminNotes" rows="3" value={form.adminNotes} onChange={updateField} placeholder="Private booking or follow-up notes" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting || !availableTrainers.length}>{isSubmitting ? 'Saving…' : selectedSession ? 'Save changes' : 'Book session'}</button></div></form></ModalShell>}
  </section>
}

export default TrainingSessions
