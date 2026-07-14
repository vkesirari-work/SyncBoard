import { ArrowRight, Clock3, CreditCard, Radio, RefreshCw, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function Dashboard() {
  const [data, setData] = useState({ members: [], payments: [], attendance: [], leads: [] })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

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
  }, [loadDashboard])

  useEffect(() => {
    const socket = getSocket()
    const events = [
      'payment:created',
      'payment:updated',
      'attendance:check-in',
      'attendance:check-out',
      'lead:created',
      'lead:updated',
    ]

    events.forEach((event) => socket.on(event, loadDashboard))
    socket.connect()

    return () => {
      events.forEach((event) => socket.off(event, loadDashboard))
      socket.disconnect()
    }
  }, [loadDashboard])

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
          return endDate >= now && endDate <= renewalLimit
        }).length,
        icon: Clock3,
      },
    ]
  }, [data])

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gym overview</p>
          <h1>Manage members, payments, and daily gym operations.</h1>
        </div>
        <Link className="primary-button" to="/dashboard/projects/main-floor">
          <span>Open member board</span>
          <ArrowRight size={18} />
        </Link>
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
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <stat.icon size={20} />
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
    </section>
  )
}

export default Dashboard
