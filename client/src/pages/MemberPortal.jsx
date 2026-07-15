import { CalendarCheck, CalendarClock, CalendarDays, CreditCard, Dumbbell, IndianRupee, Printer, ReceiptText, TrendingUp, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ModalShell from '../components/ui/ModalShell'
import { useGymSettings } from '../hooks/useGymSettings'
import { api } from '../lib/api'
import './MemberPortal.css'

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

function formatDate(value, withTime = false) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' })
}

function visitDuration(visit) {
  if (!visit.checkOut) return 'Currently inside'
  const minutes = Math.max(0, Math.round((new Date(visit.checkOut) - new Date(visit.checkIn)) / 60000))
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function prioritizeSessions(sessions) {
  const now = Date.now()
  return [...sessions].sort((a, b) => {
    const aUpcoming = a.status === 'scheduled' && new Date(a.scheduledAt).getTime() >= now
    const bUpcoming = b.status === 'scheduled' && new Date(b.scheduledAt).getTime() >= now
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
    return aUpcoming ? new Date(a.scheduledAt) - new Date(b.scheduledAt) : new Date(b.scheduledAt) - new Date(a.scheduledAt)
  })
}

function MemberPortal() {
  const gymSettings = useGymSettings()
  const [portal, setPortal] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/members/me'), api.get('/training-sessions')])
      .then(([portalResponse, sessionResponse]) => { setPortal({ ...portalResponse.data, sessions: prioritizeSessions(sessionResponse.data.sessions) }); setStatus('ready'); setError('') })
      .catch((requestError) => { setError(requestError.response?.data?.message || 'Could not load member portal.'); setStatus('error') })
  }, [])

  const stats = useMemo(() => {
    if (!portal) return { daysLeft: '—', paid: 0, visits: 0 }
    const end = portal.member.membershipEnd ? new Date(portal.member.membershipEnd) : null
    const daysLeft = end ? Math.ceil((end - new Date()) / 86400000) : null
    return {
      daysLeft: daysLeft === null ? '—' : daysLeft < 0 ? `${Math.abs(daysLeft)} overdue` : daysLeft,
      paid: portal.payments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0),
      visits: portal.attendance.length,
    }
  }, [portal])

  const member = portal?.member
  return <section className="page-stack member-portal">
    <div className="member-portal-hero">
      <div><p className="eyebrow">My fitness membership</p><h1>{member ? `Welcome back, ${member.name.split(' ')[0]}` : 'Your fitness desk'}</h1><p>Membership, coaching, attendance and payment history—all in one private workspace.</p>{member && <Link className="member-progress-link" to="/dashboard/progress/me"><TrendingUp size={15} /> View my body progress</Link>}</div>
      <div className="member-portal-mark"><Dumbbell size={31} /></div>
    </div>
    {error && <p className="dashboard-notice error" role="alert">{error}</p>}
    {status === 'loading' && <p className="empty-state">Loading your membership…</p>}
    {portal && <>
      <div className="member-portal-summary">
        <article><CalendarDays size={19} /><strong>{stats.daysLeft}</strong><span>{typeof stats.daysLeft === 'number' ? 'Days remaining' : 'Membership status'}</span></article>
        <article><CalendarCheck size={19} /><strong>{stats.visits}</strong><span>Recorded visits</span></article>
        <article><IndianRupee size={19} /><strong>{currency.format(stats.paid)}</strong><span>Total paid</span></article>
      </div>

      <div className="member-portal-grid">
        <section className="panel member-plan-card">
          <div className="section-title"><div><p className="eyebrow">Current membership</p><h2>{member.plan?.name || 'No active plan'}</h2></div><span className={`member-portal-status ${member.status}`}>{member.status}</span></div>
          <p>{member.plan?.description || 'Contact the gym desk to choose a membership plan.'}</p>
          <div className="member-plan-dates"><span><small>Started</small><strong>{formatDate(member.membershipStart)}</strong></span><span><small>Valid until</small><strong>{formatDate(member.membershipEnd)}</strong></span><span><small>Plan duration</small><strong>{member.plan?.durationMonths ? `${member.plan.durationMonths} month${member.plan.durationMonths === 1 ? '' : 's'}` : '—'}</strong></span></div>
        </section>

        <section className="panel member-trainer-card">
          <div className="section-title"><div><p className="eyebrow">My coach</p><h2>{portal.trainer?.name || 'Not assigned yet'}</h2></div><UserRound size={20} /></div>
          {portal.trainer ? <><span>{portal.trainer.specialties?.join(' · ') || 'General fitness'}</span><p>{portal.trainer.bio || 'Your trainer will guide your workouts and track your progress.'}</p><div><small>Shift</small><strong className="capitalize">{portal.trainer.shift?.replaceAll('_', ' ')}</strong></div></> : <p>The gym admin can assign a trainer to your membership.</p>}
        </section>
      </div>

      {member.trainerNotes && <section className="member-progress-card"><Dumbbell size={20} /><div><p className="eyebrow">Latest coaching update</p><p>{member.trainerNotes}</p>{member.progressUpdatedAt && <small>Updated {formatDate(member.progressUpdatedAt, true)}</small>}</div></section>}

      <section className="panel member-session-panel"><div className="section-title"><div><p className="eyebrow">Personal training</p><h2>My sessions</h2></div><CalendarClock size={20} /></div><div className="member-session-list">{portal.sessions.slice(0, 12).map((session) => <article key={session._id}><div className="member-session-date"><strong>{new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong><span>{new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div><div><strong>{session.focus || 'General training'}</strong><span>{session.trainer?.name} · {session.durationMinutes} min</span>{session.status === 'completed' && session.trainerNotes && <small>{session.trainerNotes}</small>}</div><em className={session.status}>{session.status.replaceAll('_', ' ')}</em></article>)}</div>{!portal.sessions.length && <p className="empty-state">No personal training sessions booked yet.</p>}</section>

      <div className="member-history-grid">
        <section className="panel">
          <div className="section-title"><div><p className="eyebrow">Attendance</p><h2>Recent visits</h2></div><CalendarCheck size={20} /></div>
          <div className="member-visit-list">{portal.attendance.slice(0, 8).map((visit) => <article key={visit._id}><span></span><div><strong>{formatDate(visit.checkIn)}</strong><small>{formatDate(visit.checkIn, true).split(',').slice(-1)[0]}</small></div><em className={!visit.checkOut ? 'inside' : ''}>{visitDuration(visit)}</em></article>)}</div>
          {!portal.attendance.length && <p className="empty-state">No attendance recorded yet.</p>}
        </section>

        <section className="panel">
          <div className="section-title"><div><p className="eyebrow">Payments</p><h2>Payment history</h2></div><CreditCard size={20} /></div>
          <div className="member-payment-list">{portal.payments.map((payment) => <article key={payment._id}><div><strong>{payment.plan?.name || 'Membership payment'}</strong><span>{formatDate(payment.paidAt)} · {payment.method.replaceAll('_', ' ')}</span></div><div><strong>{currency.format(payment.amount)}</strong><span className={`member-payment-status ${payment.status}`}>{payment.status}</span></div><button className="icon-button small" type="button" aria-label={`Open receipt for ${payment.plan?.name || 'payment'}`} title="View receipt" onClick={() => setReceipt(payment)}><ReceiptText size={15} /></button></article>)}</div>
          {!portal.payments.length && <p className="empty-state">No payment history available.</p>}
        </section>
      </div>
    </>}

    {receipt && <ModalShell className="member-receipt-modal" labelledBy="member-receipt-title" onClose={() => setReceipt(null)}><div className="modal-header member-receipt-controls"><div><p className="eyebrow">Payment receipt</p><h2 id="member-receipt-title">Receipt preview</h2></div><button className="icon-button" type="button" onClick={() => setReceipt(null)} aria-label="Close"><X size={18} /></button></div><div className="member-receipt-sheet"><header><div>{gymSettings.logoUrl ? <img src={gymSettings.logoUrl} alt="" /> : <span>{gymSettings.gymName.slice(0, 1)}</span>}<div><strong>{gymSettings.gymName}</strong><small>{gymSettings.address}</small></div></div><em>PAID</em></header><div className="member-receipt-meta"><span><small>Receipt</small><strong>SF-{receipt._id.slice(-8).toUpperCase()}</strong></span><span><small>Paid on</small><strong>{formatDate(receipt.paidAt)}</strong></span></div><div className="member-receipt-member"><small>Received from</small><strong>{member.name}</strong><span>{member.email || member.phone}</span></div><div className="member-receipt-line"><div><strong>{receipt.plan?.name || 'Membership payment'}</strong><small>Paid via {receipt.method.replaceAll('_', ' ')}</small></div><strong>{currency.format(receipt.amount)}</strong></div><div className="member-receipt-total"><span>Total paid</span><strong>{currency.format(receipt.amount)}</strong></div><footer>{gymSettings.receiptFooter}</footer></div><div className="modal-actions member-receipt-controls"><button className="secondary-button" type="button" onClick={() => setReceipt(null)}>Close</button><button className="primary-button" type="button" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button></div></ModalShell>}
  </section>
}

export default MemberPortal
