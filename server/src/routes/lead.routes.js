import { Router } from 'express'
import { createLead, createPublicLead, deleteLead, listLeads, updateLead } from '../controllers/lead.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'
import { publicLeadRateLimit } from '../middleware/rate-limit.middleware.js'

export const leadRouter = Router()

leadRouter.post('/', publicLeadRateLimit, createPublicLead)
leadRouter.post('/admin', requireAuth, requirePermission('leads'), createLead)
leadRouter.get('/', requireAuth, requirePermission('leads'), listLeads)
leadRouter.patch('/:id', requireAuth, requirePermission('leads'), updateLead)
leadRouter.delete('/:id', requireAuth, requirePermission('leads'), deleteLead)
