import { Router } from 'express'
import {
  createPayment,
  createCheckoutOrder,
  deletePayment,
  listPayments,
  updatePayment,
  verifyCheckoutPayment,
} from '../controllers/payment.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const paymentRouter = Router()

paymentRouter.use(requireAuth)
paymentRouter.use(requireRole('admin', 'user'))
paymentRouter.get('/', listPayments)
paymentRouter.post('/checkout/order', createCheckoutOrder)
paymentRouter.post('/checkout/verify', verifyCheckoutPayment)
paymentRouter.post('/', createPayment)
paymentRouter.patch('/:id', updatePayment)
paymentRouter.delete('/:id', deletePayment)
