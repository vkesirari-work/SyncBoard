import { BellRing, CalendarClock, CheckCheck, CircleDollarSign, RefreshCw, Trash2, UserRoundSearch } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import Pagination from '../components/ui/Pagination'
import { useServerPagination } from '../hooks/usePagination'
import './Notifications.css'

const typeMeta = {
  renewal: { label: 'Renewal', icon: CalendarClock },
  payment: { label: 'Payment', icon: CircleDollarSign },
  lead: { label: 'Lead', icon: UserRoundSearch },
  system: { label: 'System', icon: BellRing },
}

function dueLabel(value) {
  const days = Math.ceil((new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days}d`
}

function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [counts, setCounts] = useState({ renewal: 0, payment: 0, lead: 0 })
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const notificationPagination = useServerPagination(total, { resetKey: `${typeFilter}|${statusFilter}` })

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { type: typeFilter, status: statusFilter, page: notificationPagination.page, limit: notificationPagination.pageSize } })
      setNotifications(data.notifications)
      setTotal(data.pagination?.total ?? data.notifications.length)
      setUnreadCount(data.unreadCount)
      setCounts(data.counts || { renewal: 0, payment: 0, lead: 0 })
      setError('')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not load notifications.') }
    finally { setLoading(false) }
  }, [notificationPagination.page, notificationPagination.pageSize, statusFilter, typeFilter])

  useEffect(() => { setLoading(true); loadNotifications() }, [loadNotifications])

  useEffect(() => {
    const socket = getSocket()
    const events = ['notification:updated', 'member:created', 'member:updated', 'payment:created', 'payment:updated', 'lead:created', 'lead:updated']
    events.forEach((event) => socket.on(event, loadNotifications))
    return () => events.forEach((event) => socket.off(event, loadNotifications))
  }, [loadNotifications])

  async function markRead(notification, open = false) {
    try {
      if (!notification.isRead) await api.patch(`/notifications/${notification._id}/read`)
      if (!notification.isRead) {
        setNotifications((current) => statusFilter === 'unread' ? current.filter((item) => item._id !== notification._id) : current.map((item) => item._id === notification._id ? { ...item, isRead: true } : item))
        setUnreadCount((current) => Math.max(0, current - 1))
        setActionMessage('Notification marked as read.')
        window.dispatchEvent(new Event('notifications:changed'))
      }
      if (open) navigate(notification.link)
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not update notification.') }
  }

  async function markAllRead() {
    try { await api.patch('/notifications/read-all'); setNotifications((current) => statusFilter === 'unread' ? [] : current.map((item) => ({ ...item, isRead: true }))); setUnreadCount(0); setActionMessage('All notifications marked as read.'); window.dispatchEvent(new Event('notifications:changed')) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not mark notifications as read.') }
  }

  async function syncNow() {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', { params: { type: typeFilter, status: statusFilter, page: notificationPagination.page, limit: notificationPagination.pageSize, force: true } })
      setNotifications(data.notifications); setTotal(data.pagination?.total ?? data.notifications.length); setUnreadCount(data.unreadCount); setCounts(data.counts || { renewal: 0, payment: 0, lead: 0 }); setError('')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not sync reminders.') }
    finally { setLoading(false) }
  }

  async function dismiss(notification) {
    try { await api.delete(`/notifications/${notification._id}`); setNotifications((current) => current.filter((item) => item._id !== notification._id)); setCounts((current) => ({ ...current, [notification.type]: Math.max(0, (current[notification.type] || 0) - 1) })); if (!notification.isRead) setUnreadCount((current) => Math.max(0, current - 1)); setActionMessage('Notification dismissed.'); window.dispatchEvent(new Event('notifications:changed')) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not dismiss notification.') }
  }

  return <section className="page-stack notifications-page">
    <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><BellRing size={22} /></div><div><p className="eyebrow">Action centre</p><h1>Notifications</h1><p className="page-description">Renewals, pending payments and lead follow-ups that need attention.</p></div></div><div className="notification-header-actions"><button className="secondary-button" type="button" onClick={syncNow}><RefreshCw size={16} /> Sync</button><button className="primary-button" type="button" disabled={!unreadCount} onClick={markAllRead}><CheckCheck size={17} /> Mark all read</button></div></div>
    <div className="payment-summary notification-summary"><article className="stat-card"><BellRing size={20} /><strong>{unreadCount}</strong><span>Unread alerts</span></article><article className="stat-card"><strong>{counts.renewal}</strong><span>Renewal reminders</span></article><article className="stat-card"><strong>{counts.payment}</strong><span>Pending payments</span></article><article className="stat-card"><strong>{counts.lead}</strong><span>Lead follow-ups</span></article></div>
    <section className="panel notification-panel">
      <div className="member-toolbar payment-toolbar"><select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All types</option><option value="renewal">Renewals</option><option value="payment">Payments</option><option value="lead">Leads</option></select><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="unread">Unread</option><option value="read">Read</option></select></div>
      {error && <p className="dashboard-notice error" role="alert">{error}</p>}
      {actionMessage && <p className="notification-action-message" role="status">{actionMessage}<button type="button" onClick={() => setActionMessage('')}>Dismiss</button></p>}
      <div className="notification-list">
        {notifications.map((notification) => { const meta = typeMeta[notification.type] || typeMeta.system; const Icon = meta.icon; return <article className={`notification-item ${notification.isRead ? 'read' : 'unread'} priority-${notification.priority}`} key={notification._id}><div className={`notification-type-icon ${notification.type}`}><Icon size={19} /></div><button className="notification-main" type="button" onClick={() => markRead(notification, true)}><span className="notification-item-top"><span className="notification-type-label">{meta.label}</span><span className={`read-state ${notification.isRead ? 'is-read' : ''}`}>{notification.isRead ? 'Read' : 'Unread'}</span><span className={`priority-label ${notification.priority}`}>{notification.priority}</span><time>{dueLabel(notification.dueAt)}</time></span><strong>{notification.title}</strong><p>{notification.message}</p></button><div className="notification-actions">{!notification.isRead ? <button className="secondary-button compact" type="button" onClick={() => markRead(notification)}>Mark read</button> : <span className="read-confirmation">✓ Read</span>}<button className="icon-button small danger" type="button" aria-label="Dismiss notification" title="Dismiss" onClick={() => dismiss(notification)}><Trash2 size={15} /></button></div></article> })}
      </div>
      <Pagination pagination={notificationPagination} label="notifications" />
      {loading && <p className="empty-state">Syncing reminders…</p>}
      {!loading && notifications.length === 0 && <p className="empty-state">All caught up. No reminders match these filters.</p>}
    </section>
  </section>
}

export default Notifications
