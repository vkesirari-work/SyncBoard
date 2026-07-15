import { Router } from 'express'
import { resetDashboardData } from '../controllers/admin.controller.js'
import { getAnalytics } from '../controllers/analytics.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const adminRouter = Router()

adminRouter.use(requireAuth)
adminRouter.get('/analytics', getAnalytics)
adminRouter.post('/reset-data', resetDashboardData)
