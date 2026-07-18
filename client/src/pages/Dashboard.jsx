import { ArrowRight, Clock3, CreditCard, Dumbbell, Radio, RefreshCw, Trash2, Users, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import './Dashboard.css'
import { useAuthStore } from '../store/useAuthStore'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const isOwner = ['admin', 'user'].includes(user?.role)
  const canAccess = (permission) => isOwner || user?.permissions?.includes(permission)
  const [data, setData] = useState({ members: [], payments: [], attendance: [], leads: [] })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [resetStep, setResetStep] = useState(0)
  const [resetConfirmation, setResetConfirmation] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const loadDashboard = useCallback(async () => {
    setError('')

    try {
      const [members, payments, attendance, leads] = await Promise.all([
        api.get('/members'),
        api.get('/payments'),
        api.get('/attendance'),
        api.get('/leads'),
      ])

      setData({
        members: members.data.members,
        payments: payments.data.payments,
        attendance: attendance.data.attendance,
        leads: leads.data.leads,
      })
      setStatus('ready')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load dashboard data.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadDashboard()
    window.addEventListener('member:created', loadDashboard)

    return () => window.removeEventListener('member:created', loadDashboard)
  }, [loadDashboard])

  useEffect(() => {
    const socket = getSocket()
    const events = [
      'payment:created',
      'payment:updated',
      'payment:deleted',
      'attendance:check-in',
      'attendance:check-out',
      'attendance:updated',
      'attendance:deleted',
      'lead:created',
      'lead:updated',
      'lead:deleted',
      'member:created',
      'member:updated',
      'dashboard:reset',
    ]

    events.forEach((event) => socket.on(event, loadDashboard))
    socket.connect()

    return () => {
      events.forEach((event) => socket.off(event, loadDashboard))
      socket.disconnect()
    }
  }, [loadDashboard])

  function closeResetModal() {
    if (isResetting) return
    setResetStep(0)
    setResetConfirmation('')
  }

  async function clearDashboardData() {
    if (resetConfirmation !== 'sirari') return
    setIsResetting(true)
    setError('')

    try {
      await api.post('/admin/reset-data', { confirmation: resetConfirmation })
      closeResetModal()
      setResetStep(0)
      setResetConfirmation('')
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not clear dashboard data.')
    } finally {
      setIsResetting(false)
    }
  }

  const stats = useMemo(() => {
    const now = new Date()
    const today = now.toDateString()
    const month = now.getMonth()
    const year = now.getFullYear()
    const renewalLimit = new Date(now)
    renewalLimit.setDate(renewalLimit.getDate() + 30)

    const monthlyRevenue = data.payments
      .filter((payment) => {
        const paidAt = new Date(payment.paidAt)
        return payment.status === 'paid' && paidAt.getMonth() === month && paidAt.getFullYear() === year
      })
      .reduce((sum, payment) => sum + payment.amount, 0)

    return [
      { label: 'Active members', value: data.members.filter((member) => member.status === 'active').length, icon: Users },
      { label: 'Today check-ins', value: data.attendance.filter((visit) => new Date(visit.checkIn).toDateString() === today).length, icon: Radio },
      { label: 'Monthly revenue', value: currency.format(monthlyRevenue), icon: CreditCard },
      {
        label: 'Renewals due',
        value: data.members.filter((member) => {
          if (!member.membershipEnd) return false
          const endDate = new Date(member.membershipEnd)
          return endDate <= renewalLimit
        }).length,
        icon: Clock3,
      },
    ]
  }, [data])

  return (
    <section className="page-stack dashboard-page">
      <div className="page-header dashboard-hero">
        <div className="dashboard-hero-copy">
          <div className="dashboard-live-pill"><span /> Live performance</div>
          <div className="page-title-row"><div className="page-title-icon"><Dumbbell size={22} /></div><div><p className="eyebrow">Sirari command center</p><h1>Your gym,<br /><em>in motion.</em></h1><p className="page-description">Members, revenue and today’s activity in one powerful view.</p></div></div>
        </div>
        <div className="dashboard-header-actions">
          {canAccess('members') && <Link className="primary-button" to="/dashboard/members">
            <span>View members</span>
            <ArrowRight size={18} />
          </Link>}
        </div>
        <div className="dashboard-orbit" aria-hidden="true"><span className="orbit-ring" /><span className="orbit-core"><Dumbbell size={30} /></span><span className="orbit-dot" /></div>
        <div className="dashboard-hero-rail" aria-hidden="true"><span>TRAIN / TRACK / TRANSFORM / SIRARI FITNESS / </span><span>TRAIN / TRACK / TRANSFORM / SIRARI FITNESS / </span></div>
      </div>

      {status === 'error' && (
        <div className="dashboard-notice error" role="alert">
          <span>{error}</span>
          <button className="secondary-button" type="button" onClick={loadDashboard}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      <div className="stats-grid" aria-busy={status === 'loading'}>
        {stats.map((stat, index) => (
          <article className={`stat-card stat-accent-${index + 1} ${status === 'loading' ? 'is-loading' : ''}`} key={stat.label}>
            <div className="stat-card-top"><span className="stat-index">0{index + 1}</span><stat.icon size={20} /></div>
            <strong>{status === 'loading' ? '—' : stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Sales pipeline</p>
              <h2>Recent leads</h2>
            </div>
            {canAccess('leads') && <Link className="dashboard-section-link" to="/dashboard/leads">View all <ArrowRight size={14} /></Link>}
          </div>
          <div className="data-list">
            {data.leads.slice(0, 6).map((lead) => (
              <div className="data-row" key={lead._id}>
                <div>
                  <strong>{lead.name}</strong>
                  <span>{lead.phone} · {lead.fitnessGoal?.replaceAll('_', ' ') || 'General enquiry'}</span>
                </div>
                <span className="status-pill">{lead.status}</span>
              </div>
            ))}
            {status === 'ready' && data.leads.length === 0 && <p className="empty-state">No leads yet.</p>}
          </div>
        </section>

        <aside className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Revenue</p>
              <h2>Recent payments</h2>
            </div>
            {canAccess('payments') && <Link className="dashboard-section-link" to="/dashboard/payments">View all <ArrowRight size={14} /></Link>}
          </div>
          <div className="data-list">
            {data.payments.slice(0, 6).map((payment) => (
              <div className="data-row" key={payment._id}>
                <div>
                  <strong>{payment.member?.name || 'Member'}</strong>
                  <span>{new Date(payment.paidAt).toLocaleDateString('en-IN')} · {payment.method.replaceAll('_', ' ')}</span>
                </div>
                <strong>{currency.format(payment.amount)}</strong>
              </div>
            ))}
            {status === 'ready' && data.payments.length === 0 && <p className="empty-state">No payments recorded yet.</p>}
          </div>
        </aside>
      </div>

      {isOwner && <div className="reset-data-corner"><button className="secondary-button compact reset-data-trigger" type="button" onClick={() => setResetStep(1)} title="Clear local or demo dashboard records"><Trash2 size={14} /> Reset test data</button></div>}

      {isOwner && resetStep > 0 && createPortal(
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeResetModal()
        }}>
          <section className="modal-card reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow danger-eyebrow">Danger zone</p>
                <h2 id="reset-title">Clear all dashboard data?</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close" onClick={closeResetModal} disabled={isResetting}>
                <X size={18} />
              </button>
            </div>

            {resetStep === 1 ? (
              <>
                <p className="reset-warning">Members, payments, attendance, leads, plans and trainers will be permanently deleted. Your login account will remain safe.</p>
                <div className="modal-actions">
                  <button className="secondary-button" type="button" onClick={closeResetModal}>Cancel</button>
                  <button className="danger-button solid" type="button" onClick={() => setResetStep(2)}>Yes, continue</button>
                </div>
              </>
            ) : (
              <>
                <label className="reset-confirm-field">
                  Type <strong>sirari</strong> to confirm
                  <input autoFocus value={resetConfirmation} onChange={(event) => setResetConfirmation(event.target.value)} placeholder="sirari" />
                </label>
                <div className="modal-actions">
                  <button className="secondary-button" type="button" onClick={() => setResetStep(1)} disabled={isResetting}>Back</button>
                  <button className="danger-button solid" type="button" disabled={resetConfirmation !== 'sirari' || isResetting} onClick={clearDashboardData}>
                    {isResetting ? 'Clearing…' : 'Delete all data'}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>,
        document.body,
      )}
    </section>
  )
}

export default Dashboard
