import { Bell } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { getSocket } from '../../lib/socket'

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  const loadCount = useCallback(() => {
    api.get('/notifications', { params: { status: 'unread', limit: 1 } })
      .then(({ data }) => setUnreadCount(data.unreadCount))
      .catch(() => setUnreadCount(0))
  }, [])

  useEffect(() => {
    loadCount()
    const socket = getSocket()
    const events = ['notification:updated', 'member:created', 'member:updated', 'payment:created', 'payment:updated', 'lead:created', 'lead:updated']
    events.forEach((event) => socket.on(event, loadCount))
    const onVisibilityChange = () => { if (document.visibilityState === 'visible') loadCount() }
    window.addEventListener('notifications:changed', loadCount)
    window.addEventListener('focus', loadCount)
    document.addEventListener('visibilitychange', onVisibilityChange)
    const interval = window.setInterval(loadCount, 30_000)
    return () => {
      events.forEach((event) => socket.off(event, loadCount))
      window.removeEventListener('notifications:changed', loadCount)
      window.removeEventListener('focus', loadCount)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(interval)
    }
  }, [loadCount])

  return <Link className="icon-button notification-bell" to="/dashboard/notifications" aria-label={`${unreadCount} unread notifications`} title={`${unreadCount} unread notifications`}><Bell size={18} />{unreadCount > 0 && <span>{unreadCount > 999 ? '999+' : unreadCount}</span>}</Link>
}

export default NotificationBell
