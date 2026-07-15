import { Router } from 'express'
import {
  createPlan,
  deletePlan,
  listPlans,
  updatePlan,
} from '../controllers/plan.controller.js'
import { requireAnyPermission, requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const planRouter = Router()

planRouter.use(requireAuth)
planRouter.get('/', requireAnyPermission(['plans', 'members', 'payments']), listPlans)
planRouter.post('/', requirePermission('plans'), createPlan)
planRouter.patch('/:id', requirePermission('plans'), updatePlan)
planRouter.delete('/:id', requirePermission('plans'), deletePlan)
