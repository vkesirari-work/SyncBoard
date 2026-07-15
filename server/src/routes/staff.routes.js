import { Router } from 'express'
import { createStaff, listAuditLogs, listStaff, resetStaffPassword, updateStaff } from '../controllers/staff.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const staffRouter = Router()

staffRouter.use(requireAuth)
staffRouter.use(requireRole('admin', 'user'))
staffRouter.get('/', listStaff)
staffRouter.post('/', createStaff)
staffRouter.patch('/:id', updateStaff)
staffRouter.put('/:id/password', resetStaffPassword)
staffRouter.get('/audit/logs', listAuditLogs)
