import { Router } from 'express'
import { createLead, listLeads, updateLead } from '../controllers/lead.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const leadRouter = Router()

leadRouter.post('/', createLead)
leadRouter.get('/', requireAuth, listLeads)
leadRouter.patch('/:id', requireAuth, updateLead)
