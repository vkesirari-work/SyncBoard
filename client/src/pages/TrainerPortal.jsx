import { Activity, CalendarClock, CalendarDays, CalendarOff, CheckCircle2, Clock3, Dumbbell, Plus, Save, Trash2, Users, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import ModalShell from '../components/ui/ModalShell'
import './TrainerPortal.css'

function prioritizeSessions(sessions) {
  const now = Date.now()
  return [...sessions].sort((a, b) => {
    const aUpcoming = a.status === 'scheduled' && new Date(a.scheduledAt).getTime() >= now
    const bUpcoming = b.status === 'scheduled' && new Date(b.scheduledAt).getTime() >= now
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
    return aUpcoming ? new Date(a.scheduledAt) - new Date(b.scheduledAt) : new Date(b.scheduledAt) - new Date(a.scheduledAt)
  })
}

function TrainerPortal() {
  const navigate = useNavigate()
  const [trainer, setTrainer] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionNotes, setSessionNotes] = useState('')
  const [leaves, setLeaves] = useState([])
  const [isLeaveOpen, setIsLeaveOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' })

  async function loadProfile() {
    try { const [profileResponse, sessionResponse, leaveResponse] = await Promise.all([api.get('/trainers/me'), api.get('/training-sessions'), api.get('/trainer-leaves')]); setTrainer(profileResponse.data.trainer); setSessions(prioritizeSessions(sessionResponse.data.sessions)); setLeaves(leaveResponse.data.leaves); setError(''); setStatus('ready') }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not load trainer workspace.'); setStatus('error') }
  }

  useEffect(() => { loadProfile() }, [])

  const activeMembers = useMemo(() => trainer?.assignedMembers?.filter((member) => member.status === 'active').length || 0, [trainer])

  function openProgress(member) { setSelectedMember(member); setNotes(member.trainerNotes || '') }
  async function saveProgress(event) {
    event.preventDefault()
    setStatus('saving')
    try { await api.patch(`/members/${selectedMember._id}`, { trainerNotes: notes }); setSelectedMember(null); await loadProfile() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not save progress note.'); setStatus('ready') }
  }
  function openSessionAction(session) { setSelectedSession(session); setSessionNotes(session.trainerNotes || '') }
  async function saveSessionAction(event, nextStatus) {
    event.preventDefault(); setStatus('saving')
    try { await api.patch(`/training-sessions/${selectedSession._id}`, { status: nextStatus, trainerNotes: sessionNotes }); setSelectedSession(null); await loadProfile() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not update training session.'); setStatus('ready') }
  }
  async function requestLeave(event) {
    event.preventDefault(); setStatus('saving'); setError('')
    try { await api.post('/trainer-leaves', leaveForm); setIsLeaveOpen(false); setLeaveForm({ startDate: '', endDate: '', reason: '' }); await loadProfile() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not submit leave request.'); setStatus('ready') }
  }
  async function cancelLeave(leave) {
    if (!window.confirm('Cancel this pending leave request?')) return
    try { await api.delete(`/trainer-leaves/${leave._id}`); await loadProfile() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not cancel leave request.') }
  }

  return <section className="page-stack trainer-portal">
    <div className="trainer-hero"><div><p className="eyebrow">Trainer workspace</p><h1>{trainer ? `Welcome, ${trainer.name.split(' ')[0]}` : 'Your coaching desk'}</h1><p>Focus on assigned members, follow-ups and training progress.</p></div><div className="trainer-hero-mark"><Dumbbell size={30} /></div></div>
    {error && <p className="dashboard-notice error" role="alert">{error}</p>}
    <div className="trainer-summary"><article><Users size={19} /><strong>{trainer?.assignedMembers?.length || 0}</strong><span>Assigned members</span></article><article><Dumbbell size={19} /><strong>{activeMembers}</strong><span>Active members</span></article><article><Clock3 size={19} /><strong className="capitalize">{trainer?.shift?.replaceAll('_', ' ') || '—'}</strong><span>Current shift</span></article></div>
    <section className="panel trainer-schedule-panel"><div className="section-title"><div><p className="eyebrow">My schedule</p><h2>Training sessions</h2></div><CalendarClock size={20} /></div><div className="trainer-session-list">{sessions.slice(0, 12).map((session) => <article key={session._id}><div className="trainer-session-date"><strong>{new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong><span>{new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div><div><strong>{session.member?.name}</strong><span>{session.focus || 'General training'} · {session.durationMinutes} min</span></div><em className={session.status}>{session.status.replaceAll('_', ' ')}</em>{session.status === 'scheduled' && <button className="secondary-button compact" type="button" onClick={() => openSessionAction(session)}><CheckCircle2 size={14} /> Update</button>}</article>)}</div>{status === 'ready' && !sessions.length && <p className="empty-state">No sessions scheduled yet.</p>}</section>
    <section className="panel trainer-leave-panel"><div className="section-title"><div><p className="eyebrow">Availability</p><h2>My leave requests</h2></div><button className="secondary-button compact" type="button" onClick={() => { setLeaveForm({ startDate: '', endDate: '', reason: '' }); setIsLeaveOpen(true) }}><Plus size={14} /> Request leave</button></div><div className="trainer-leave-list">{leaves.slice(0, 8).map((leave) => <article key={leave._id}><CalendarOff size={17} /><div><strong>{new Date(leave.startDate).toLocaleDateString('en-IN')} — {new Date(leave.endDate).toLocaleDateString('en-IN')}</strong><span>{leave.reason}</span>{leave.adminNote && <small>Admin: {leave.adminNote}</small>}</div><em className={leave.status}>{leave.status}</em>{leave.status === 'pending' && <button className="icon-button small danger" type="button" aria-label="Cancel pending leave" onClick={() => cancelLeave(leave)}><Trash2 size={14} /></button>}</article>)}</div>{!leaves.length && <p className="empty-state">No leave requests yet.</p>}</section>
    <section className="panel trainer-members-panel"><div className="section-title"><div><p className="eyebrow">My members</p><h2>Assigned coaching list</h2></div><span className="trainer-specialties">{trainer?.specialties?.join(' · ') || 'General fitness'}</span></div><div className="trainer-member-grid">{trainer?.assignedMembers?.map((member) => <article key={member._id}><div className="trainer-member-avatar">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div className="trainer-member-info"><strong>{member.name}</strong><span>{member.phone}</span><small>{member.plan?.name || 'No plan'} · <b>{member.status}</b></small></div><div className="trainer-member-due"><CalendarDays size={14} />{member.membershipEnd ? new Date(member.membershipEnd).toLocaleDateString('en-IN') : 'No end date'}</div><div className="trainer-member-progress-actions"><button className="secondary-button compact" type="button" onClick={() => navigate(`/dashboard/progress/${member._id}`)}><Activity size={14} /> Full progress</button><button className="secondary-button compact" type="button" onClick={() => openProgress(member)}>{member.trainerNotes ? 'Quick note' : 'Add note'}</button></div></article>)}</div>{status === 'loading' && <p className="empty-state">Loading assigned members…</p>}{status === 'ready' && !trainer?.assignedMembers?.length && <p className="empty-state">No members assigned yet. Ask the admin to assign members from Trainers.</p>}</section>
    {selectedMember && <ModalShell labelledBy="progress-title" isBusy={status === 'saving'} onClose={() => setSelectedMember(null)}><div className="modal-header"><div><p className="eyebrow">Coaching progress</p><h2 id="progress-title">{selectedMember.name}</h2></div><button className="icon-button" type="button" onClick={() => setSelectedMember(null)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveProgress}><label>Progress notes<textarea autoFocus rows="7" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Workout progress, form notes, goals or follow-up…" /></label>{selectedMember.progressUpdatedAt && <p className="trainer-last-update">Last updated {new Date(selectedMember.progressUpdatedAt).toLocaleString('en-IN')}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelectedMember(null)}>Cancel</button><button className="primary-button" type="submit" disabled={status === 'saving'}><Save size={16} /> {status === 'saving' ? 'Saving…' : 'Save progress'}</button></div></form></ModalShell>}
    {selectedSession && <ModalShell labelledBy="session-action-title" isBusy={status === 'saving'} onClose={() => setSelectedSession(null)}><div className="modal-header"><div><p className="eyebrow">Session update</p><h2 id="session-action-title">{selectedSession.member?.name}</h2></div><button className="icon-button" type="button" onClick={() => setSelectedSession(null)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={(event) => saveSessionAction(event, 'completed')}><p className="trainer-session-summary">{new Date(selectedSession.scheduledAt).toLocaleString('en-IN')} · {selectedSession.durationMinutes} min · {selectedSession.focus || 'General training'}</p><label>Session notes<textarea autoFocus rows="6" value={sessionNotes} onChange={(event) => setSessionNotes(event.target.value)} placeholder="Exercises, performance, next-session plan…" /></label><div className="modal-actions trainer-session-actions"><button className="secondary-button" type="button" onClick={(event) => saveSessionAction(event, 'no_show')} disabled={status === 'saving'}>Mark no show</button><button className="primary-button" type="submit" disabled={status === 'saving'}><CheckCircle2 size={16} /> Complete session</button></div></form></ModalShell>}
    {isLeaveOpen && <ModalShell labelledBy="trainer-leave-title" isBusy={status === 'saving'} onClose={() => setIsLeaveOpen(false)}><div className="modal-header"><div><p className="eyebrow">Availability</p><h2 id="trainer-leave-title">Request leave</h2></div><button className="icon-button" type="button" onClick={() => setIsLeaveOpen(false)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={requestLeave}><div className="form-grid equal"><label>Start date<input autoFocus type="date" value={leaveForm.startDate} onChange={(event) => setLeaveForm((current) => ({ ...current, startDate: event.target.value }))} required /></label><label>End date<input type="date" min={leaveForm.startDate} value={leaveForm.endDate} onChange={(event) => setLeaveForm((current) => ({ ...current, endDate: event.target.value }))} required /></label></div><label>Reason<textarea rows="4" value={leaveForm.reason} onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason for leave request" required /></label><p className="trainer-session-summary">The admin will review this request. Approved dates automatically block new session bookings.</p><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsLeaveOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={status === 'saving'}>Submit request</button></div></form></ModalShell>}
  </section>
}

export default TrainerPortal
