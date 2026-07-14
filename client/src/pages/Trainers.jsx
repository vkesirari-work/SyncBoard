import { Pencil, Plus, RefreshCw, Search, Trash2, UserRoundCog, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import { useSearchParams } from 'react-router-dom'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const initialForm = { name: '', phone: '', email: '', specialties: '', shift: 'flexible', workingDays: [], joinedAt: new Date().toISOString().slice(0, 10), isActive: 'true', assignedMembers: [], bio: '' }

function Trainers() {
  const [searchParams] = useSearchParams()
  const [trainers, setTrainers] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState(initialForm)
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [query, setQuery] = useState(() => searchParams.get('search') || '')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const loadTrainers = useCallback(async () => {
    try {
      const { data } = await api.get('/trainers')
      setTrainers(data.trainers)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load trainers.')
    }
  }, [])

  useEffect(() => {
    loadTrainers()
    api.get('/members').then(({ data }) => setMembers(data.members)).catch(() => setError('Could not load members.'))
  }, [loadTrainers])

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const socket = getSocket()
    const events = ['trainer:created', 'trainer:updated', 'trainer:deleted']
    events.forEach((event) => socket.on(event, loadTrainers))
    socket.connect()
    return () => {
      events.forEach((event) => socket.off(event, loadTrainers))
      socket.disconnect()
    }
  }, [loadTrainers])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updateMultiSelect(event) {
    setForm((current) => ({ ...current, [event.target.name]: Array.from(event.target.selectedOptions, (option) => option.value) }))
  }

  function toggleDay(day) {
    setForm((current) => ({ ...current, workingDays: current.workingDays.includes(day) ? current.workingDays.filter((item) => item !== day) : [...current.workingDays, day] }))
  }

  function openCreateForm() {
    setSelectedTrainer(null)
    setForm({ ...initialForm, joinedAt: new Date().toISOString().slice(0, 10) })
    setIsFormOpen(true)
  }

  function openEditForm(trainer) {
    setSelectedTrainer(trainer)
    setForm({ name: trainer.name || '', phone: trainer.phone || '', email: trainer.email || '', specialties: trainer.specialties?.join(', ') || '', shift: trainer.shift || 'flexible', workingDays: trainer.workingDays || [], joinedAt: trainer.joinedAt ? new Date(trainer.joinedAt).toISOString().slice(0, 10) : '', isActive: String(trainer.isActive), assignedMembers: trainer.assignedMembers?.map((member) => member._id) || [], bio: trainer.bio || '' })
    setIsFormOpen(true)
  }

  async function saveTrainer(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    const payload = { ...form, specialties: form.specialties.split(',').map((item) => item.trim()).filter(Boolean), isActive: form.isActive === 'true' }
    try {
      if (selectedTrainer) await api.patch(`/trainers/${selectedTrainer._id}`, payload)
      else await api.post('/trainers', payload)
      setIsFormOpen(false)
      await loadTrainers()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save trainer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteTrainer(trainer) {
    if (!window.confirm(`Delete trainer ${trainer.name}?`)) return
    setDeletingId(trainer._id)
    setError('')
    try {
      await api.delete(`/trainers/${trainer._id}`)
      await loadTrainers()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete trainer.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredTrainers = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return trainers
    return trainers.filter((trainer) => [trainer.name, trainer.phone, trainer.email, trainer.shift, ...(trainer.specialties || [])].some((value) => value?.toLowerCase().includes(search)))
  }, [trainers, query])

  return <section className="page-stack">
    <div className="page-header"><div><p className="eyebrow">Coaching team</p><h1>Trainers</h1><p className="page-description">Manage trainer profiles, schedules, specialties, and assigned members.</p></div><button className="primary-button" type="button" onClick={openCreateForm}><Plus size={18} /> Add trainer</button></div>
    <div className="payment-summary"><article className="stat-card"><UserRoundCog size={20} /><strong>{trainers.filter((trainer) => trainer.isActive).length}</strong><span>Active trainers</span></article><article className="stat-card"><strong>{trainers.reduce((sum, trainer) => sum + trainer.assignedMembers.length, 0)}</strong><span>Member assignments</span></article><article className="stat-card"><strong>{trainers.length}</strong><span>Total trainer records</span></article></div>
    <section className="panel"><div className="member-toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, specialty, or shift" /></div><button className="secondary-button" type="button" onClick={loadTrainers}><RefreshCw size={16} /> Refresh</button></div>{error && <p className="dashboard-notice error" role="alert">{error}</p>}<div className="member-table-wrap"><table className="member-table"><thead><tr><th>Trainer</th><th>Specialties</th><th>Shift</th><th>Working days</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredTrainers.map((trainer) => <tr key={trainer._id}><td><strong>{trainer.name}</strong><span>{trainer.phone}{trainer.email ? ` · ${trainer.email}` : ''}</span></td><td>{trainer.specialties?.join(', ') || '—'}</td><td className="capitalize">{trainer.shift.replaceAll('_', ' ')}</td><td className="capitalize">{trainer.workingDays?.map((day) => day.slice(0, 3)).join(', ') || '—'}</td><td>{trainer.assignedMembers.length}</td><td><span className="status-pill">{trainer.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="table-actions"><button className="icon-button small" type="button" aria-label={`Edit ${trainer.name}`} onClick={() => openEditForm(trainer)}><Pencil size={15} /></button><button className="icon-button small danger" type="button" aria-label={`Delete ${trainer.name}`} disabled={deletingId === trainer._id} onClick={() => deleteTrainer(trainer)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{filteredTrainers.length === 0 && <p className="empty-state">No matching trainers found.</p>}</section>
    {isFormOpen && <div className="modal-backdrop" role="presentation"><section className="modal-card modal-card-wide" role="dialog" aria-modal="true" aria-labelledby="trainer-modal-title"><div className="modal-header"><div><p className="eyebrow">Coaching team</p><h2 id="trainer-modal-title">{selectedTrainer ? 'View and edit trainer' : 'Add trainer'}</h2></div><button className="icon-button" type="button" onClick={() => setIsFormOpen(false)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveTrainer}><label>Name<input autoFocus name="name" value={form.name} onChange={updateField} required /></label><div className="form-grid equal"><label>Phone<input name="phone" type="tel" value={form.phone} onChange={updateField} required /></label><label>Email<input name="email" type="email" value={form.email} onChange={updateField} /></label></div><label>Specialties<input name="specialties" value={form.specialties} onChange={updateField} placeholder="Strength, fat loss, mobility" /></label><div className="form-grid equal"><label>Shift<select name="shift" value={form.shift} onChange={updateField}><option value="morning">Morning</option><option value="evening">Evening</option><option value="full_day">Full day</option><option value="flexible">Flexible</option></select></label><label>Joined date<input name="joinedAt" type="date" value={form.joinedAt} onChange={updateField} /></label></div><fieldset className="day-selector"><legend>Working days</legend><div>{days.map((day) => <label key={day}><input type="checkbox" checked={form.workingDays.includes(day)} onChange={() => toggleDay(day)} /> <span className="capitalize">{day.slice(0, 3)}</span></label>)}</div></fieldset><label>Assigned members<select name="assignedMembers" multiple size="5" value={form.assignedMembers} onChange={updateMultiSelect}>{members.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.phone}</option>)}</select><small>Hold Command/Ctrl to select multiple members.</small></label><label>Status<select name="isActive" value={form.isActive} onChange={updateField}><option value="true">Active</option><option value="false">Inactive</option></select></label><label>Bio and notes<textarea name="bio" rows="3" value={form.bio} onChange={updateField} /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : selectedTrainer ? 'Save changes' : 'Add trainer'}</button></div></form></section></div>}
  </section>
}

export default Trainers
