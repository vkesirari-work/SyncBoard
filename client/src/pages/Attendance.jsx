import { CalendarCheck, LogIn, LogOut, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import ModalShell from '../components/ui/ModalShell'
import { getSocket } from '../lib/socket'
import './Attendance.css'

function toDateTimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const newVisit = () => ({
  member: '',
  checkIn: toDateTimeInput(new Date()),
  checkOut: '',
  notes: '',
})

function Attendance() {
  const [records, setRecords] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState(newVisit)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [query, setQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')

  const loadAttendance = useCallback(async () => {
    try {
      const { data } = await api.get('/attendance')
      setRecords(data.attendance)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load attendance.')
    }
  }, [])

  useEffect(() => {
    loadAttendance()
    api.get('/members')
      .then(({ data }) => setMembers(data.members.filter((member) => member.status === 'active')))
      .catch(() => setError('Could not load active members.'))
  }, [loadAttendance])

  useEffect(() => {
    const socket = getSocket()
    const events = ['attendance:check-in', 'attendance:check-out', 'attendance:updated', 'attendance:deleted']
    events.forEach((event) => socket.on(event, loadAttendance))
    socket.connect()
    return () => {
      events.forEach((event) => socket.off(event, loadAttendance))
      socket.disconnect()
    }
  }, [loadAttendance])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function openCheckIn() {
    setSelectedRecord(null)
    setForm(newVisit())
    setModalError('')
    setIsFormOpen(true)
  }

  function openEdit(record) {
    setSelectedRecord(record)
    setModalError('')
    setForm({
      member: record.member?._id || '',
      checkIn: toDateTimeInput(record.checkIn),
      checkOut: toDateTimeInput(record.checkOut),
      notes: record.notes || '',
    })
    setIsFormOpen(true)
  }

  async function saveAttendance(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setModalError('')
    try {
      if (selectedRecord) {
        await api.patch(`/attendance/${selectedRecord._id}`, {
          ...form,
          checkOut: form.checkOut || null,
        })
      } else {
        const payload = { member: form.member, checkIn: form.checkIn, notes: form.notes }
        await api.post('/attendance/check-in', payload)
      }
      setIsFormOpen(false)
      await loadAttendance()
    } catch (requestError) {
      setModalError(requestError.response?.data?.message || 'Could not save attendance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function checkOut(record) {
    setBusyId(record._id)
    setError('')
    try {
      await api.patch(`/attendance/${record._id}/check-out`)
      await loadAttendance()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not check out member.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteRecord(record) {
    if (!window.confirm(`Delete attendance record for ${record.member?.name || 'member'}?`)) return
    setBusyId(record._id)
    setError('')
    try {
      await api.delete(`/attendance/${record._id}`)
      await loadAttendance()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete attendance record.')
    } finally {
      setBusyId(null)
    }
  }

  const filteredRecords = useMemo(() => {
    const search = query.trim().toLowerCase()
    return records.filter((record) => {
      if (showActiveOnly && record.checkOut) return false
      return !search || [record.member?.name, record.member?.phone, record.notes]
        .some((value) => value?.toLowerCase().includes(search))
    })
  }, [records, query, showActiveOnly])

  const today = new Date().toDateString()
  const insideMemberIds = new Set(records.filter((record) => !record.checkOut).map((record) => record.member?._id))
  const selectableMembers = selectedRecord ? members : members.filter((member) => !insideMemberIds.has(member._id))
  const insideCount = members.length - selectableMembers.length

  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="page-title-row"><div className="page-title-icon"><CalendarCheck size={22} /></div><div><p className="eyebrow">Gym floor</p><h1>Attendance</h1><p className="page-description">Manage member check-ins, check-outs, and visit corrections.</p></div></div>
        <button className="primary-button" type="button" onClick={openCheckIn}><Plus size={18} /> Check in member</button>
      </div>

      <div className="payment-summary">
        <article className="stat-card"><LogIn size={20} /><strong>{records.filter((record) => new Date(record.checkIn).toDateString() === today).length}</strong><span>Today check-ins</span></article>
        <article className="stat-card"><LogOut size={20} /><strong>{records.filter((record) => !record.checkOut).length}</strong><span>Currently inside</span></article>
        <article className="stat-card"><strong>{records.length}</strong><span>Total visit records</span></article>
      </div>

      <section className="panel">
        <div className="member-toolbar payment-toolbar">
          <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member, phone, or note" /></div>
          <label className="toggle-filter"><input type="checkbox" checked={showActiveOnly} onChange={(event) => setShowActiveOnly(event.target.checked)} /> Inside now</label>
          <button className="secondary-button" type="button" onClick={loadAttendance}><RefreshCw size={16} /> Refresh</button>
        </div>
        {error && <p className="dashboard-notice error" role="alert">{error}</p>}
        <div className="member-table-wrap">
          <table className="member-table">
            <thead><tr><th>Member</th><th>Check in</th><th>Check out</th><th>Duration</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredRecords.map((record) => {
                const durationMinutes = record.checkOut ? Math.max(0, Math.round((new Date(record.checkOut) - new Date(record.checkIn)) / 60_000)) : null
                return <tr key={record._id}>
                  <td><strong>{record.member?.name || 'Member'}</strong><span>{record.member?.phone || '—'}</span></td>
                  <td>{new Date(record.checkIn).toLocaleString('en-IN')}</td>
                  <td>{record.checkOut ? new Date(record.checkOut).toLocaleString('en-IN') : <span className="status-pill">Inside</span>}</td>
                  <td>{durationMinutes === null ? 'Running' : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`}</td>
                  <td>{record.notes || '—'}</td>
                  <td><div className="table-actions">{!record.checkOut && <button className="secondary-button compact" type="button" disabled={busyId === record._id} onClick={() => checkOut(record)}>Check out</button>}<button className="icon-button small" type="button" aria-label="Edit attendance" onClick={() => openEdit(record)}><Pencil size={15} /></button><button className="icon-button small danger" type="button" aria-label="Delete attendance" disabled={busyId === record._id} onClick={() => deleteRecord(record)}><Trash2 size={15} /></button></div></td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && <p className="empty-state">No matching attendance records.</p>}
      </section>

      {isFormOpen && <ModalShell labelledBy="attendance-modal-title" isBusy={isSubmitting} onClose={() => setIsFormOpen(false)}><div className="modal-header"><div><p className="eyebrow">Gym floor</p><h2 id="attendance-modal-title">{selectedRecord ? 'Edit attendance' : 'Check in member'}</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={() => setIsFormOpen(false)}><X size={18} /></button></div><form className="modal-form" onSubmit={saveAttendance}><label>Member<select name="member" value={form.member} onChange={updateField} required disabled={Boolean(selectedRecord)}><option value="" disabled>{selectableMembers.length ? 'Select active member' : 'All active members are already inside'}</option>{selectableMembers.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.phone}</option>)}</select></label>{!selectedRecord && insideCount > 0 && <p className="attendance-info">{insideCount} member{insideCount === 1 ? ' is' : 's are'} already inside and hidden from this list.</p>}<div className="form-grid equal"><label>Check in<input name="checkIn" type="datetime-local" value={form.checkIn} onChange={updateField} required /></label>{selectedRecord && <label>Check out<input name="checkOut" type="datetime-local" value={form.checkOut} onChange={updateField} /></label>}</div><label>Notes<textarea name="notes" rows="3" value={form.notes} onChange={updateField} /></label>{modalError && <p className="form-error" role="alert">{modalError}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting || (!selectedRecord && selectableMembers.length === 0)}>{isSubmitting ? 'Saving…' : selectedRecord ? 'Save changes' : 'Check in'}</button></div></form></ModalShell>}
    </section>
  )
}

export default Attendance
