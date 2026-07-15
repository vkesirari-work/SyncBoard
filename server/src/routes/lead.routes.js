import { Router } from 'express'
import { createLead, deleteLead, listLeads, updateLead } from '../controllers/lead.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const leadRouter = Router()

leadRouter.post('/', createLead)
leadRouter.get('/', requireAuth, requirePermission('leads'), listLeads)
leadRouter.patch('/:id', requireAuth, requirePermission('leads'), updateLead)
leadRouter.delete('/:id', requireAuth, requirePermission('leads'), deleteLead)
