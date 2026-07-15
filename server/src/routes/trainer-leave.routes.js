import { Router } from 'express'
import { createTrainerLeave, deleteTrainerLeave, listTrainerLeaves, reviewTrainerLeave } from '../controllers/trainer-leave.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const trainerLeaveRouter = Router()

trainerLeaveRouter.use(requireAuth)
trainerLeaveRouter.get('/', requireRole('admin', 'user', 'trainer'), listTrainerLeaves)
trainerLeaveRouter.post('/', requireRole('admin', 'user', 'trainer'), createTrainerLeave)
trainerLeaveRouter.patch('/:id', requireRole('admin', 'user'), reviewTrainerLeave)
trainerLeaveRouter.delete('/:id', requireRole('admin', 'user', 'trainer'), deleteTrainerLeave)
