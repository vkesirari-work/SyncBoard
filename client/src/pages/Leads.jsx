import { GripVertical, Pencil, Plus, RefreshCw, Search, Trash2, UserRoundSearch, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import ModalShell from '../components/ui/ModalShell'
import { getSocket } from '../lib/socket'
import { useSearchParams } from 'react-router-dom'
import './Leads.css'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  fitnessGoal: '',
  message: '',
  source: 'admin',
  status: 'new',
}

const pipelineColumns = [
  { id: 'new', label: 'New leads', hint: 'Fresh enquiries' },
  { id: 'contacted', label: 'Contacted', hint: 'Conversation started' },
  { id: 'converted', label: 'Converted', hint: 'Joined the gym' },
  { id: 'closed', label: 'Closed', hint: 'Not moving ahead' },
]

function Leads() {
  const [searchParams] = useSearchParams()
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(initialForm)
  const [selectedLead, setSelectedLead] = useState(null)
  const [query, setQuery] = useState(() => searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [draggedLeadId, setDraggedLeadId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [movingId, setMovingId] = useState(null)
  const [visibleCounts, setVisibleCounts] = useState(() => Object.fromEntries(pipelineColumns.map(({ id }) => [id, 12])))

  const loadLeads = useCallback(async () => {
    try {
      const { data } = await api.get('/leads')
      setLeads(data.leads)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load leads.')
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    const socket = getSocket()
    const events = ['lead:created', 'lead:updated', 'lead:deleted']
    events.forEach((event) => socket.on(event, loadLeads))
    return () => {
      events.forEach((event) => socket.off(event, loadLeads))
    }
  }, [loadLeads])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function openCreateForm() {
    setSelectedLead(null)
    setForm(initialForm)
    setIsFormOpen(true)
  }

  function openEditForm(lead) {
    setSelectedLead(lead)
    setForm({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      fitnessGoal: lead.fitnessGoal || '',
      message: lead.message || '',
      source: lead.source || 'website',
      status: lead.status || 'new',
    })
    setIsFormOpen(true)
  }

  async function saveLead(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const payload = { ...form, fitnessGoal: form.fitnessGoal || undefined }
      if (selectedLead) await api.patch(`/leads/${selectedLead._id}`, payload)
      else await api.post('/leads/admin', payload)
      setIsFormOpen(false)
      await loadLeads()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save lead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function moveLead(lead, status) {
    if (!lead || lead.status === status || movingId) return
    const previousStatus = lead.status
    setError('')
    setMovingId(lead._id)
    setLeads((current) => current.map((item) => item._id === lead._id ? { ...item, status } : item))
    try {
      await api.patch(`/leads/${lead._id}`, { status })
    } catch (requestError) {
      setLeads((current) => current.map((item) => item._id === lead._id ? { ...item, status: previousStatus } : item))
      setError(requestError.response?.data?.message || 'Could not update lead status.')
    } finally {
      setMovingId(null)
    }
  }

  function startDragging(event, lead) {
    setDraggedLeadId(lead._id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', lead._id)
  }

  function dropLead(event, status) {
    event.preventDefault()
    const leadId = event.dataTransfer.getData('text/plain') || draggedLeadId
    const lead = leads.find((item) => item._id === leadId)
    setDraggedLeadId(null)
    setDragOverColumn(null)
    moveLead(lead, status)
  }

  async function deleteLead(lead) {
    if (!window.confirm(`Delete lead ${lead.name}? This cannot be undone.`)) return
    setDeletingId(lead._id)
    setError('')
    try {
      await api.delete(`/leads/${lead._id}`)
      await loadLeads()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete lead.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchesSearch = !search || [lead.name, lead.phone, lead.email, lead.fitnessGoal, lead.source, lead.message]
        .some((value) => value?.toLowerCase().includes(search))
      return matchesStatus && matchesSearch
    })
  }, [leads, query, statusFilter])

  useEffect(() => {
    setVisibleCounts(Object.fromEntries(pipelineColumns.map(({ id }) => [id, 12])))
  }, [query, statusFilter])

  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="page-title-row"><div className="page-title-icon"><UserRoundSearch size={22} /></div><div><p className="eyebrow">Sales pipeline</p><h1>Leads</h1><p className="page-description">Manage enquiries from first contact through conversion.</p></div></div>
        <button className="primary-button" type="button" onClick={openCreateForm}><Plus size={18} /> Add lead</button>
      </div>

      <div className="stats-grid">
        {['new', 'contacted', 'converted', 'closed'].map((status) => <article className="stat-card" key={status}><UserRoundSearch size={20} /><strong>{leads.filter((lead) => lead.status === status).length}</strong><span className="capitalize">{status} leads</span></article>)}
      </div>

      <section className="panel lead-toolbar-panel">
        <div className="member-toolbar payment-toolbar">
          <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, goal, or source" /></div>
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="closed">Closed</option></select>
          <button className="secondary-button" type="button" onClick={loadLeads}><RefreshCw size={16} /> Refresh</button>
        </div>
        {error && <p className="dashboard-notice error" role="alert">{error}</p>}
      </section>

      <div className="lead-pipeline">
        {pipelineColumns.map((column) => {
          const columnLeads = filteredLeads.filter((lead) => lead.status === column.id)
          return (
            <section className={`lead-column lead-column-${column.id} ${dragOverColumn === column.id ? 'is-drag-over' : ''}`} key={column.id} onDragEnter={() => setDragOverColumn(column.id)} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOverColumn(null) }} onDrop={(event) => dropLead(event, column.id)}>
              <div className="lead-column-header"><div><span className="lead-column-dot" /><div><h2>{column.label}</h2><small>{column.hint}</small></div></div><span>{columnLeads.length}</span></div>
              <div className="lead-card-list">
                {columnLeads.slice(0, visibleCounts[column.id]).map((lead) => (
                  <article className={`lead-card ${draggedLeadId === lead._id ? 'is-dragging' : ''} ${movingId === lead._id ? 'is-moving' : ''}`} draggable={movingId !== lead._id} key={lead._id} onDragStart={(event) => startDragging(event, lead)} onDragEnd={() => { setDraggedLeadId(null); setDragOverColumn(null) }}>
                    <div className="lead-card-header"><div className="lead-card-identity"><GripVertical className="lead-drag-handle" size={17} aria-hidden="true" /><div><strong>{lead.name}</strong><span>{new Date(lead.createdAt).toLocaleDateString('en-IN')}</span></div></div><div className="table-actions"><button className="icon-button small" type="button" aria-label={`Edit ${lead.name}`} onClick={() => openEditForm(lead)}><Pencil size={15} /></button><button className="icon-button small danger" type="button" aria-label={`Delete ${lead.name}`} disabled={deletingId === lead._id} onClick={() => deleteLead(lead)}><Trash2 size={15} /></button></div></div>
                    <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
                    <div className="lead-card-meta"><span className="capitalize">{lead.fitnessGoal?.replaceAll('_', ' ') || 'General enquiry'}</span><span className="capitalize">{lead.source}</span></div>
                    {lead.message && <p>{lead.message}</p>}
                    <div className="lead-drag-note"><GripVertical size={13} /> Drag to move</div>
                  </article>
                ))}
                {columnLeads.length > visibleCounts[column.id] && <button className="lead-show-more" type="button" onClick={() => setVisibleCounts((current) => ({ ...current, [column.id]: current[column.id] + 12 }))}>Show 12 more <span>{columnLeads.length - visibleCounts[column.id]} remaining</span></button>}
                {columnLeads.length === 0 && <p className="lead-column-empty">No leads</p>}
              </div>
            </section>
          )
        })}
      </div>

      {isFormOpen && <ModalShell labelledBy="lead-modal-title" isBusy={isSubmitting} onClose={() => setIsFormOpen(false)}><div className="modal-header"><div><p className="eyebrow">Sales pipeline</p><h2 id="lead-modal-title">{selectedLead ? 'Edit lead' : 'Add lead'}</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={() => setIsFormOpen(false)}><X size={18} /></button></div><form className="modal-form" onSubmit={saveLead}><label>Name<input autoFocus name="name" value={form.name} onChange={updateField} required /></label><div className="form-grid equal"><label>Phone<input name="phone" type="tel" value={form.phone} onChange={updateField} required /></label><label>Email<input name="email" type="email" value={form.email} onChange={updateField} /></label></div><div className="form-grid equal"><label>Fitness goal<select name="fitnessGoal" value={form.fitnessGoal} onChange={updateField}><option value="">General enquiry</option><option value="fat_loss">Fat loss</option><option value="muscle_gain">Muscle gain</option><option value="general_fitness">General fitness</option><option value="personal_training">Personal training</option></select></label><label>Status<select name="status" value={form.status} onChange={updateField}><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="closed">Closed</option></select></label></div><label>Source<input name="source" value={form.source} onChange={updateField} /></label><label>Message and follow-up notes<textarea name="message" rows="4" value={form.message} onChange={updateField} /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : selectedLead ? 'Save changes' : 'Add lead'}</button></div></form></ModalShell>}
    </section>
  )
}

export default Leads
