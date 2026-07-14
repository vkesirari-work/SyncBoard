import { Router } from 'express'
import {
  createTrainer,
  deleteTrainer,
  listTrainers,
  updateTrainer,
} from '../controllers/trainer.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const trainerRouter = Router()

trainerRouter.use(requireAuth)
trainerRouter.get('/', listTrainers)
trainerRouter.post('/', createTrainer)
trainerRouter.patch('/:id', updateTrainer)
trainerRouter.delete('/:id', deleteTrainer)
