import { History, KeyRound, Pencil, Plus, RefreshCw, ShieldCheck, UserRoundCheck, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ModalShell from '../components/ui/ModalShell'
import { api } from '../lib/api'
import './StaffSecurity.css'

const permissionLabels = { dashboard: 'Staff workspace', analytics: 'Analytics & reports', members: 'Members & renewals', plans: 'Plans', payments: 'Payments', attendance: 'Attendance', leads: 'Leads CRM', trainers: 'Trainers & availability', sessions: 'Training sessions', notifications: 'Notifications', settings: 'Gym settings' }
const initialForm = { name: '', email: '', password: '', permissions: ['dashboard', 'members', 'plans', 'payments', 'attendance', 'leads', 'sessions', 'notifications'], isActive: true }

function StaffSecurity() {
  const [staff, setStaff] = useState([])
  const [permissions, setPermissions] = useState([])
  const [logs, setLogs] = useState([])
  const [tab, setTab] = useState('accounts')
  const [form, setForm] = useState(initialForm)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [resetStaff, setResetStaff] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const loadData = useCallback(async () => {
    try {
      const [staffResponse, auditResponse] = await Promise.all([api.get('/staff'), api.get('/staff/audit/logs?limit=150')])
      setStaff(staffResponse.data.staff); setPermissions(staffResponse.data.availablePermissions); setLogs(auditResponse.data.logs); setMessage({ type: '', text: '' })
    } catch (requestError) { setMessage({ type: 'error', text: requestError.response?.data?.message || 'Could not load staff security.' }) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  const activeCount = useMemo(() => staff.filter((account) => account.isActive).length, [staff])

  function openCreate() { setSelectedStaff(null); setForm(initialForm); setMessage({ type: '', text: '' }); setIsFormOpen(true) }
  function openEdit(account) { setSelectedStaff(account); setForm({ name: account.name, email: account.email, password: '', permissions: account.permissions || [], isActive: account.isActive }); setMessage({ type: '', text: '' }); setIsFormOpen(true) }
  function togglePermission(permission) { if (permission === 'dashboard') return; setForm((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] })) }
  async function saveStaff(event) {
    event.preventDefault(); setIsSubmitting(true); setMessage({ type: '', text: '' })
    try {
      const payload = { ...form, permissions: [...new Set(['dashboard', ...form.permissions])] }
      if (selectedStaff) { delete payload.password; await api.patch(`/staff/${selectedStaff.id}`, payload) }
      else await api.post('/staff', payload)
      setIsFormOpen(false); await loadData()
    } catch (requestError) { setMessage({ type: 'error', text: requestError.response?.data?.message || 'Could not save staff account.' }) }
    finally { setIsSubmitting(false) }
  }
  async function toggleAccount(account) {
    setMessage({ type: '', text: '' })
    try { await api.patch(`/staff/${account.id}`, { isActive: !account.isActive }); await loadData() }
    catch (requestError) { setMessage({ type: 'error', text: requestError.response?.data?.message || 'Could not update account.' }) }
  }
  async function saveResetPassword(event) {
    event.preventDefault(); setIsSubmitting(true); setMessage({ type: '', text: '' })
    try { await api.put(`/staff/${resetStaff.id}/password`, { password: resetPassword }); setResetStaff(null); setResetPassword(''); setMessage({ type: 'success', text: 'Staff password reset successfully.' }); await loadData() }
    catch (requestError) { setMessage({ type: 'error', text: requestError.response?.data?.message || 'Could not reset password.' }) }
    finally { setIsSubmitting(false) }
  }
  async function changeOwnPassword(event) {
    event.preventDefault(); setMessage({ type: '', text: '' })
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setMessage({ type: 'error', text: 'New passwords do not match.' })
    setIsSubmitting(true)
    try { const { data } = await api.patch('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage({ type: 'success', text: data.message }) }
    catch (requestError) { setMessage({ type: 'error', text: requestError.response?.data?.message || 'Could not change password.' }) }
    finally { setIsSubmitting(false) }
  }

  return <section className="page-stack staff-security-page">
    <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><ShieldCheck size={22} /></div><div><p className="eyebrow">Owner controls</p><h1>Staff & security</h1><p className="page-description">Control staff access, passwords, account status, and operational audit history.</p></div></div>{tab === 'accounts' && <button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> Add staff</button>}</div>
    <div className="staff-security-summary"><article><UserRoundCheck size={19} /><strong>{activeCount}</strong><span>Active staff</span></article><article><ShieldCheck size={19} /><strong>{permissions.length}</strong><span>Permission modules</span></article><article><History size={19} /><strong>{logs.length}</strong><span>Recent audit events</span></article></div>
    <div className="staff-tabs" role="tablist"><button className={tab === 'accounts' ? 'active' : ''} type="button" onClick={() => setTab('accounts')}>Staff accounts</button><button className={tab === 'audit' ? 'active' : ''} type="button" onClick={() => setTab('audit')}>Audit log</button><button className={tab === 'password' ? 'active' : ''} type="button" onClick={() => setTab('password')}>My password</button><button className="staff-refresh" type="button" onClick={loadData}><RefreshCw size={14} /> Refresh</button></div>
    {message.text && <p className={`dashboard-notice ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>}
    {tab === 'accounts' && <section className="panel"><div className="staff-account-grid">{staff.map((account) => <article key={account.id} className={!account.isActive ? 'disabled' : ''}><div className="staff-account-avatar">{account.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div className="staff-account-info"><strong>{account.name}</strong><span>{account.email}</span><small>{account.permissions.length} modules enabled</small></div><em className={account.isActive ? 'active' : 'disabled'}>{account.isActive ? 'Active' : 'Disabled'}</em><div className="staff-permission-tags">{account.permissions.map((permission) => <span key={permission}>{permissionLabels[permission] || permission}</span>)}</div><div className="staff-account-actions"><button className="secondary-button compact" type="button" onClick={() => openEdit(account)}><Pencil size={14} /> Edit access</button><button className="secondary-button compact" type="button" onClick={() => { setResetStaff(account); setResetPassword('') }}><KeyRound size={14} /> Reset password</button><button className={`secondary-button compact ${account.isActive ? 'disable' : 'enable'}`} type="button" onClick={() => toggleAccount(account)}>{account.isActive ? 'Disable' : 'Enable'}</button></div></article>)}</div>{!staff.length && <p className="empty-state">No staff accounts yet. Owner access remains active.</p>}</section>}
    {tab === 'audit' && <section className="panel"><div className="section-title"><div><p className="eyebrow">Security trail</p><h2>Recent dashboard changes</h2></div><History size={20} /></div><div className="audit-list">{logs.map((log) => <article key={log._id}><span className={`audit-method ${log.method.toLowerCase()}`}>{log.method}</span><div><strong>{log.actorName || 'System user'}</strong><span>{log.path}</span></div><em>{log.statusCode}</em><time>{new Date(log.createdAt).toLocaleString('en-IN')}</time></article>)}</div>{!logs.length && <p className="empty-state">New successful dashboard changes will appear here.</p>}</section>}
    {tab === 'password' && <section className="panel staff-password-panel"><div className="section-title"><div><p className="eyebrow">Account security</p><h2>Change my password</h2></div><KeyRound size={20} /></div><p>Enter your current password before choosing a new password with at least 8 characters.</p><form className="modal-form" onSubmit={changeOwnPassword}><label>Current password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} required /></label><div className="form-grid equal"><label>New password<input type="password" minLength="8" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} required /></label><label>Confirm new password<input type="password" minLength="8" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} required /></label></div><div className="modal-actions"><button className="primary-button" type="submit" disabled={isSubmitting}>Change password</button></div></form></section>}
    {isFormOpen && <ModalShell className="modal-card-wide" labelledBy="staff-modal-title" isBusy={isSubmitting} onClose={() => setIsFormOpen(false)}><div className="modal-header"><div><p className="eyebrow">Staff permissions</p><h2 id="staff-modal-title">{selectedStaff ? 'Edit staff access' : 'Create staff account'}</h2></div><button className="icon-button" type="button" onClick={() => setIsFormOpen(false)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveStaff}><div className="form-grid equal"><label>Name<input autoFocus value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label></div>{!selectedStaff && <label>Temporary password<input type="password" minLength="8" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Minimum 8 characters" required /></label>}<fieldset className="staff-permission-picker"><legend>Module access</legend><p>A private staff workspace is always enabled. It only shows shortcuts to the modules selected below.</p><div>{permissions.map((permission) => <label className={form.permissions.includes(permission) ? 'selected' : ''} key={permission}><input type="checkbox" checked={form.permissions.includes(permission)} disabled={permission === 'dashboard'} onChange={() => togglePermission(permission)} /><span><strong>{permissionLabels[permission] || permission}</strong><small>{permission === 'dashboard' ? 'No owner totals or security controls' : permission === 'settings' ? 'Includes public website and receipt settings' : `View and manage ${permissionLabels[permission]?.toLowerCase() || permission}`}</small></span></label>)}</div></fieldset>{selectedStaff && <label>Status<select value={String(form.isActive)} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === 'true' }))}><option value="true">Active</option><option value="false">Disabled</option></select></label>}{message.type === 'error' && <p className="form-error" role="alert">{message.text}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}>{selectedStaff ? 'Save access' : 'Create staff'}</button></div></form></ModalShell>}
    {resetStaff && <ModalShell labelledBy="reset-staff-title" isBusy={isSubmitting} onClose={() => setResetStaff(null)}><div className="modal-header"><div><p className="eyebrow">Security reset</p><h2 id="reset-staff-title">Reset {resetStaff.name}'s password</h2></div><button className="icon-button" type="button" onClick={() => setResetStaff(null)} aria-label="Close"><X size={18} /></button></div><form className="modal-form" onSubmit={saveResetPassword}><p className="staff-reset-note">Their current password will stop working immediately after this reset.</p><label>New temporary password<input autoFocus type="password" minLength="8" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} required /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setResetStaff(null)}>Cancel</button><button className="primary-button" type="submit" disabled={isSubmitting}><KeyRound size={16} /> Reset password</button></div></form></ModalShell>}
  </section>
}

export default StaffSecurity
