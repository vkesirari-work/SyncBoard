import { Pencil, Plus, RefreshCw, Search, Trash2, UserRoundSearch, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import { useSearchParams } from 'react-router-dom'

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
  { id: 'new', label: 'New leads' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'converted', label: 'Converted' },
  { id: 'closed', label: 'Closed' },
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
    socket.connect()
    return () => {
      events.forEach((event) => socket.off(event, loadLeads))
      socket.disconnect()
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
      else await api.post('/leads', payload)
      setIsFormOpen(false)
      await loadLeads()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save lead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function quickStatus(lead, status) {
    setError('')
    try {
      await api.patch(`/leads/${lead._id}`, { status })
      await loadLeads()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update lead status.')
    }
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

  return (
    <section className="page-stack">
      <div className="page-header">
        <div><p className="eyebrow">Sales pipeline</p><h1>Leads</h1><p className="page-description">Manage enquiries from first contact through conversion.</p></div>
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
            <section className={`lead-column lead-column-${column.id}`} key={column.id}>
              <div className="lead-column-header"><h2>{column.label}</h2><span>{columnLeads.length}</span></div>
              <div className="lead-card-list">
                {columnLeads.map((lead) => (
                  <article className="lead-card" key={lead._id}>
                    <div className="lead-card-header"><div><strong>{lead.name}</strong><span>{new Date(lead.createdAt).toLocaleDateString('en-IN')}</span></div><div className="table-actions"><button className="icon-button small" type="button" aria-label={`Edit ${lead.name}`} onClick={() => openEditForm(lead)}><Pencil size={15} /></button><button className="icon-button small danger" type="button" aria-label={`Delete ${lead.name}`} disabled={deletingId === lead._id} onClick={() => deleteLead(lead)}><Trash2 size={15} /></button></div></div>
                    <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
                    <div className="lead-card-meta"><span className="capitalize">{lead.fitnessGoal?.replaceAll('_', ' ') || 'General enquiry'}</span><span className="capitalize">{lead.source}</span></div>
                    {lead.message && <p>{lead.message}</p>}
                    <label>Move to<select className="table-select" value={lead.status} onChange={(event) => quickStatus(lead, event.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="closed">Closed</option></select></label>
                  </article>
                ))}
                {columnLeads.length === 0 && <p className="lead-column-empty">No leads</p>}
              </div>
            </section>
          )
        })}
      </div>

      {isFormOpen && <div className="modal-backdrop" role="presentation"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title"><div className="modal-header"><div><p className="eyebrow">Sales pipeline</p><h2 id="lead-modal-title">{selectedLead ? 'View and edit lead' : 'Add lead'}</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={() => setIsFormOpen(false)}><X size={18} /></button></div><form className="modal-form" onSubmit={saveLead}><label>Name<input autoFocus name="name" value={form.name} onChange={updateField} required /></label><div className="form-grid equal"><label>Phone<input name="phone" type="tel" value={form.phone} onChange={updateField} required /></label><label>Email<input name="email" type="email" value={form.email} onChange={updateField} /></label></div><div className="form-grid equal"><label>Fitness goal<select name="fitnessGoal" value={form.fitnessGoal} onChange={updateField}><option value="">General enquiry</option><option value="fat_loss">Fat loss</option><option value="muscle_gain">Muscle gain</option><option value="general_fitness">General fitness</option><option value="personal_training">Personal training</option></select></label><label>Status<select name="status" value={form.status} onChange={updateField}><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="closed">Closed</option></select></label></div><label>Source<input name="source" value={form.source} onChange={updateField} /></label><label>Message and follow-up notes<textarea name="message" rows="4" value={form.message} onChange={updateField} /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : selectedLead ? 'Save changes' : 'Add lead'}</button></div></form></section></div>}
    </section>
  )
}

export default Leads
