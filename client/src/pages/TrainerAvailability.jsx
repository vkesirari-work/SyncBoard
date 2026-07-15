import { CalendarOff, Check, Clock3, Plus, RefreshCw, Search, Trash2, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ModalShell from '../components/ui/ModalShell'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import './TrainerAvailability.css'

const initialForm = { trainer: '', startDate: '', endDate: '', reason: '', adminNote: '', status: 'approved' }

function TrainerAvailability() {
  const [leaves, setLeaves] = useState([])
  const [trainers, setTrainers] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(initialForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [review, setReview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [leaveResponse, trainerResponse] = await Promise.all([api.get('/trainer-leaves'), api.get('/trainers')])
      setLeaves(leaveResponse.data.leaves); setTrainers(trainerResponse.data.trainers); setError('')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not load trainer availability.') }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const socket = getSocket(); const events = ['trainer-leave:created', 'trainer-leave:updated', 'trainer-leave:deleted']
    events.forEach((event) => socket.on(event, loadData)); socket.connect()
    return () => { events.forEach((event) => socket.off(event, loadData)); socket.disconnect() }
  }, [loadData])

  const filteredLeaves = useMemo(() => {
    const search = query.trim().toLowerCase()
    return leaves.filter((leave) => (statusFilter === 'all' || leave.status === statusFilter) && (!search || [leave.trainer?.name, leave.reason, leave.status].some((value) => value?.toLowerCase().includes(search))))
  }, [leaves, query, statusFilter])
  const counts = useMemo(() => ({ pending: leaves.filter((leave) => leave.status === 'pending').length, approved: leaves.filter((leave) => leave.status === 'approved').length, awayToday: leaves.filter((leave) => leave.status === 'approved' && new Date(leave.startDate) <= new Date() && new Date(leave.endDate) >= new Date()).length }), [leaves])

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }
  async function createLeave(event) {
    event.preventDefault(); setIsSubmitting(true); setError('')
    try { await api.post('/trainer-leaves', form); setIsFormOpen(false); setForm(initialForm); await loadData() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not save trainer leave.') }
    finally { setIsSubmitting(false) }
  }
  async function saveReview(event) {
    event.preventDefault(); setIsSubmitting(true); setError('')
    try { await api.patch(`/trainer-leaves/${review.leave._id}`, { status: review.status, adminNote: review.note }); setReview(null); await loadData() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not review leave request.') }
    finally { setIsSubmitting(false) }
  }
  async function deleteLeave(leave) {
    if (!window.confirm(`Delete ${leave.trainer?.name}'s leave record?`)) return
    try { await api.delete(`/trainer-leaves/${leave._id}`); await loadData() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not delete leave record.') }
  }

  return <section className="page-stack availability-page">
    <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><CalendarOff size={22} /></div><div><p className="eyebrow">Coaching operations</p><h1>Trainer availability</h1><p className="page-description">Review leave requests and keep session booking aligned with trainer schedules.</p></div></div><button className="primary-button" type="button" onClick={() => { setForm(initialForm); setError(''); setIsFormOpen(true) }}><Plus size={18} /> Add leave</button></div>
    <div className="availability-summary"><article><Clock3 size={19} /><strong>{counts.pending}</strong><span>Pending requests</span></article><article><CalendarOff size={19} /><strong>{counts.awayToday}</strong><span>Away today</span></article><article><Check size={19} /><strong>{counts.approved}</strong><span>Approved records</span></article></div>
    <section className="panel"><div className="member-toolbar availability-toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search trainer, reason, or status" /></div><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><button className="secondary-button" type="button" onClick={loadData}><RefreshCw size={16} /> Refresh</button></div>{error && <p className="dashboard-notice error" role="alert">{error}</p>}<div className="availability-grid">{filteredLeaves.map((leave) => <article key={leave._id}><div className="availability-avatar">{leave.trainer?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="availability-info"><strong>{leave.trainer?.name}</strong><span>{new Date(leave.startDate).toLocaleDateString('en-IN')} — {new Date(leave.endDate).toLocaleDateString('en-IN')}</span><p>{leave.reason}</p>{leave.adminNote && <small>Admin: {leave.adminNote}</small>}</div><span className={`availability-status ${leave.status}`}>{leave.status}</span><div className="availability-actions">{leave.status === 'pending' && <><button className="secondary-button compact approve" type="button" onClick={() => setReview({ leave, status: 'approved', note: '' })}><Check size={14} /> Approve</button><button className="secondary-button compact reject" type="button" onClick={() => setReview({ leave, status: 'rejected', note: '' })}><XCircle size={14} /> Reject</button></>}<button className="icon-button small danger" type="button" aria-label={`Delete leave for ${leave.trainer?.name}`} onClick={() => deleteLeave(leave)}><Trash2 size={15} /></button></div></article>)}</div>{!filteredLeaves.length && <p className="empty-state">No leave records match these filters.</p>}</section>
    {isFormOpen && <ModalShell labelledBy="leave-modal-title" isBusy={isSubmitting} onClose={() => setIsFormOpen(false)}><div className="modal-header"><div><p className="eyebrow">Availability calendar</p><h2 id="leave-modal-title">Add trainer leave</h2></div><button className="icon-button" type="button" onClick={() => setIsFormOpen(false)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={createLeave}><label>Trainer<select name="trainer" value={form.trainer} onChange={updateField} required><option value="">Select trainer</option>{trainers.filter((trainer) => trainer.isActive).map((trainer) => <option key={trainer._id} value={trainer._id}>{trainer.name}</option>)}</select></label><div className="form-grid equal"><label>Start date<input type="date" name="startDate" value={form.startDate} onChange={updateField} required /></label><label>End date<input type="date" name="endDate" value={form.endDate} min={form.startDate} onChange={updateField} required /></label></div><label>Reason<textarea name="reason" rows="3" value={form.reason} onChange={updateField} required /></label><label>Status<select name="status" value={form.status} onChange={updateField}><option value="approved">Approved</option><option value="pending">Pending</option></select></label><label>Admin note<textarea name="adminNote" rows="2" value={form.adminNote} onChange={updateField} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}>Save leave</button></div></form></ModalShell>}
    {review && <ModalShell labelledBy="review-leave-title" isBusy={isSubmitting} onClose={() => setReview(null)}><div className="modal-header"><div><p className="eyebrow">Leave review</p><h2 id="review-leave-title">{review.status === 'approved' ? 'Approve' : 'Reject'} {review.leave.trainer?.name}</h2></div><button className="icon-button" type="button" onClick={() => setReview(null)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveReview}><p className="review-leave-summary">{new Date(review.leave.startDate).toLocaleDateString('en-IN')} — {new Date(review.leave.endDate).toLocaleDateString('en-IN')}<br />{review.leave.reason}</p><label>Admin note<textarea autoFocus rows="3" value={review.note} onChange={(event) => setReview((current) => ({ ...current, note: event.target.value }))} placeholder={review.status === 'rejected' ? 'Explain why this request is rejected' : 'Optional approval note'} required={review.status === 'rejected'} /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setReview(null)}>Cancel</button><button className={`primary-button ${review.status === 'rejected' ? 'danger-button' : ''}`} type="submit" disabled={isSubmitting}>{review.status === 'approved' ? 'Approve leave' : 'Reject request'}</button></div></form></ModalShell>}
  </section>
}

export default TrainerAvailability
