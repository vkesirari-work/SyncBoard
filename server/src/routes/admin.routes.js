import { Router } from 'express'
import { resetDashboardData } from '../controllers/admin.controller.js'
import { getAnalytics } from '../controllers/analytics.controller.js'
import { requireAuth, requirePermission, requireRole } from '../middleware/auth.middleware.js'

export const adminRouter = Router()

adminRouter.use(requireAuth)
adminRouter.get('/analytics', requirePermission('analytics'), getAnalytics)
adminRouter.post('/reset-data', requireRole('admin', 'user'), resetDashboardData)
