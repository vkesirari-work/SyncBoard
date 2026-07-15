import { Router } from 'express'
import { dismissNotification, listNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/notification.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const notificationRouter = Router()

notificationRouter.use(requireAuth)
notificationRouter.use(requirePermission('notifications'))
notificationRouter.get('/', listNotifications)
notificationRouter.patch('/read-all', markAllNotificationsRead)
notificationRouter.patch('/:id/read', markNotificationRead)
notificationRouter.delete('/:id', dismissNotification)
