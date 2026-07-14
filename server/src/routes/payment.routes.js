import { Router } from 'express'
import {
  createPayment,
  deletePayment,
  listPayments,
  updatePayment,
} from '../controllers/payment.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const paymentRouter = Router()

paymentRouter.use(requireAuth)
paymentRouter.get('/', listPayments)
paymentRouter.post('/', createPayment)
paymentRouter.patch('/:id', updatePayment)
paymentRouter.delete('/:id', deletePayment)
