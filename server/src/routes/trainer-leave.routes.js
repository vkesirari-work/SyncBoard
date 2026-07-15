import { Router } from 'express'
import { createTrainerLeave, deleteTrainerLeave, listTrainerLeaves, reviewTrainerLeave } from '../controllers/trainer-leave.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const trainerLeaveRouter = Router()

trainerLeaveRouter.use(requireAuth)
trainerLeaveRouter.get('/', requirePermission('trainers', 'trainer'), listTrainerLeaves)
trainerLeaveRouter.post('/', requirePermission('trainers', 'trainer'), createTrainerLeave)
trainerLeaveRouter.patch('/:id', requirePermission('trainers'), reviewTrainerLeave)
trainerLeaveRouter.delete('/:id', requirePermission('trainers', 'trainer'), deleteTrainerLeave)
