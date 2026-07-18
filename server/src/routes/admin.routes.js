import { Router } from 'express'
import { getDashboardOverview, resetDashboardData, searchDashboard } from '../controllers/admin.controller.js'
import { getAnalytics } from '../controllers/analytics.controller.js'
import { requireAnyPermission, requireAuth, requirePermission, requireRole } from '../middleware/auth.middleware.js'

export const adminRouter = Router()

adminRouter.use(requireAuth)
adminRouter.get('/analytics', requirePermission('analytics'), getAnalytics)
adminRouter.get('/dashboard', requireRole('admin', 'user'), getDashboardOverview)
adminRouter.get('/search', requireAnyPermission(['members', 'leads', 'payments', 'plans', 'trainers']), searchDashboard)
adminRouter.post('/reset-data', requireRole('admin', 'user'), resetDashboardData)
