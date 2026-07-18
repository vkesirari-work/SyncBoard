import { Notification } from '../models/notification.model.js'
import { syncNotifications } from '../services/notification.service.js'
import { emitDashboardUpdate } from '../realtime/socket.js'
import { paginationMeta, parsePagination } from '../utils/pagination.js'

export async function listNotifications(request, response, next) {
  try {
    await syncNotifications(request.query.force === 'true')
    const filter = { dismissedAt: null, resolvedAt: null }
    if (request.query.type && request.query.type !== 'all') filter.type = request.query.type
    if (request.query.status === 'unread') filter.isRead = false
    if (request.query.status === 'read') filter.isRead = true
    const { page, limit, skip } = parsePagination(request.query, { defaultLimit: 100, maxLimit: 500 })
    const activeFilter = { dismissedAt: null, resolvedAt: null }
    const [notifications, total, unreadCount, renewalCount, paymentCount, leadCount] = await Promise.all([
      Notification.find(filter).sort({ priorityRank: -1, dueAt: 1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...activeFilter, isRead: false }),
      Notification.countDocuments({ ...activeFilter, type: 'renewal' }),
      Notification.countDocuments({ ...activeFilter, type: 'payment' }),
      Notification.countDocuments({ ...activeFilter, type: 'lead' }),
    ])
    response.json({ notifications, pagination: paginationMeta(total, page, limit), unreadCount, counts: { renewal: renewalCount, payment: paymentCount, lead: leadCount } })
  } catch (error) { next(error) }
}

export async function markNotificationRead(request, response, next) {
  try {
    const notification = await Notification.findByIdAndUpdate(request.params.id, { isRead: true, readAt: new Date() }, { new: true })
    if (!notification) return response.status(404).json({ message: 'Notification not found' })
    emitDashboardUpdate(request, 'notification:updated', notification)
    response.json({ notification })
  } catch (error) { next(error) }
}

export async function markAllNotificationsRead(request, response, next) {
  try {
    const result = await Notification.updateMany({ dismissedAt: null, resolvedAt: null, isRead: false }, { $set: { isRead: true, readAt: new Date() } })
    emitDashboardUpdate(request, 'notification:updated')
    response.json({ updatedCount: result.modifiedCount })
  } catch (error) { next(error) }
}

export async function dismissNotification(request, response, next) {
  try {
    const notification = await Notification.findByIdAndUpdate(request.params.id, { dismissedAt: new Date() }, { new: true })
    if (!notification) return response.status(404).json({ message: 'Notification not found' })
    emitDashboardUpdate(request, 'notification:updated', notification)
    response.status(204).end()
  } catch (error) { next(error) }
}
