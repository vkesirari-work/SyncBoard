import { Router } from 'express'
import {
  createTrainer,
  deleteTrainer,
  listTrainers,
  updateTrainer,
  getMyTrainerProfile,
  saveTrainerAccount,
} from '../controllers/trainer.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const trainerRouter = Router()

trainerRouter.use(requireAuth)
trainerRouter.get('/me', requireRole('trainer'), getMyTrainerProfile)
trainerRouter.get('/', requireRole('admin', 'user'), listTrainers)
trainerRouter.post('/', requireRole('admin', 'user'), createTrainer)
trainerRouter.put('/:id/account', requireRole('admin', 'user'), saveTrainerAccount)
trainerRouter.patch('/:id', requireRole('admin', 'user'), updateTrainer)
trainerRouter.delete('/:id', requireRole('admin', 'user'), deleteTrainer)
