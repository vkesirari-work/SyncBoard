import { Router } from 'express'
import {
  createPlan,
  deletePlan,
  listPlans,
  updatePlan,
} from '../controllers/plan.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const planRouter = Router()

planRouter.use(requireAuth)
planRouter.get('/', listPlans)
planRouter.post('/', createPlan)
planRouter.patch('/:id', updatePlan)
planRouter.delete('/:id', deletePlan)
