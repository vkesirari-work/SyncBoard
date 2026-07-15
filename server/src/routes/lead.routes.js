import { Router } from 'express'
import { createLead, deleteLead, listLeads, updateLead } from '../controllers/lead.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const leadRouter = Router()

leadRouter.post('/', createLead)
leadRouter.get('/', requireAuth, requireRole('admin', 'user'), listLeads)
leadRouter.patch('/:id', requireAuth, requireRole('admin', 'user'), updateLead)
leadRouter.delete('/:id', requireAuth, requireRole('admin', 'user'), deleteLead)
