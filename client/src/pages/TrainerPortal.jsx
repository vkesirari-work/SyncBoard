import { CalendarDays, Clock3, Dumbbell, Save, Users, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import ModalShell from '../components/ui/ModalShell'
import './TrainerPortal.css'

function TrainerPortal() {
  const [trainer, setTrainer] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  async function loadProfile() {
    try { const { data } = await api.get('/trainers/me'); setTrainer(data.trainer); setError(''); setStatus('ready') }
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

  return <section className="page-stack trainer-portal">
    <div className="trainer-hero"><div><p className="eyebrow">Trainer workspace</p><h1>{trainer ? `Welcome, ${trainer.name.split(' ')[0]}` : 'Your coaching desk'}</h1><p>Focus on assigned members, follow-ups and training progress.</p></div><div className="trainer-hero-mark"><Dumbbell size={30} /></div></div>
    {error && <p className="dashboard-notice error" role="alert">{error}</p>}
    <div className="trainer-summary"><article><Users size={19} /><strong>{trainer?.assignedMembers?.length || 0}</strong><span>Assigned members</span></article><article><Dumbbell size={19} /><strong>{activeMembers}</strong><span>Active members</span></article><article><Clock3 size={19} /><strong className="capitalize">{trainer?.shift?.replaceAll('_', ' ') || '—'}</strong><span>Current shift</span></article></div>
    <section className="panel trainer-members-panel"><div className="section-title"><div><p className="eyebrow">My members</p><h2>Assigned coaching list</h2></div><span className="trainer-specialties">{trainer?.specialties?.join(' · ') || 'General fitness'}</span></div><div className="trainer-member-grid">{trainer?.assignedMembers?.map((member) => <article key={member._id}><div className="trainer-member-avatar">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div className="trainer-member-info"><strong>{member.name}</strong><span>{member.phone}</span><small>{member.plan?.name || 'No plan'} · <b>{member.status}</b></small></div><div className="trainer-member-due"><CalendarDays size={14} />{member.membershipEnd ? new Date(member.membershipEnd).toLocaleDateString('en-IN') : 'No end date'}</div><button className="secondary-button compact" type="button" onClick={() => openProgress(member)}>{member.trainerNotes ? 'Update progress' : 'Add progress'}</button></article>)}</div>{status === 'loading' && <p className="empty-state">Loading assigned members…</p>}{status === 'ready' && !trainer?.assignedMembers?.length && <p className="empty-state">No members assigned yet. Ask the admin to assign members from Trainers.</p>}</section>
    {selectedMember && <ModalShell labelledBy="progress-title" isBusy={status === 'saving'} onClose={() => setSelectedMember(null)}><div className="modal-header"><div><p className="eyebrow">Coaching progress</p><h2 id="progress-title">{selectedMember.name}</h2></div><button className="icon-button" type="button" onClick={() => setSelectedMember(null)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveProgress}><label>Progress notes<textarea autoFocus rows="7" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Workout progress, form notes, goals or follow-up…" /></label>{selectedMember.progressUpdatedAt && <p className="trainer-last-update">Last updated {new Date(selectedMember.progressUpdatedAt).toLocaleString('en-IN')}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelectedMember(null)}>Cancel</button><button className="primary-button" type="submit" disabled={status === 'saving'}><Save size={16} /> {status === 'saving' ? 'Saving…' : 'Save progress'}</button></div></form></ModalShell>}
  </section>
}

export default TrainerPortal
