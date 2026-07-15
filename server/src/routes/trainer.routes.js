import { Router } from 'express'
import {
  createTrainer,
  deleteTrainer,
  listTrainers,
  updateTrainer,
  getMyTrainerProfile,
  saveTrainerAccount,
} from '../controllers/trainer.controller.js'
import { requireAnyPermission, requireAuth, requirePermission, requireRole } from '../middleware/auth.middleware.js'

export const trainerRouter = Router()

trainerRouter.use(requireAuth)
trainerRouter.get('/me', requireRole('trainer'), getMyTrainerProfile)
trainerRouter.get('/', requireAnyPermission(['trainers', 'sessions']), listTrainers)
trainerRouter.post('/', requirePermission('trainers'), createTrainer)
trainerRouter.put('/:id/account', requireRole('admin', 'user'), saveTrainerAccount)
trainerRouter.patch('/:id', requirePermission('trainers'), updateTrainer)
trainerRouter.delete('/:id', requirePermission('trainers'), deleteTrainer)
