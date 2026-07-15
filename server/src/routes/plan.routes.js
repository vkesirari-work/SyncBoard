import { Router } from 'express'
import {
  createPlan,
  deletePlan,
  listPlans,
  updatePlan,
} from '../controllers/plan.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const planRouter = Router()

planRouter.use(requireAuth)
planRouter.use(requireRole('admin', 'user'))
planRouter.get('/', listPlans)
planRouter.post('/', createPlan)
planRouter.patch('/:id', updatePlan)
planRouter.delete('/:id', deletePlan)
