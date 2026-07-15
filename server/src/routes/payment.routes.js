import { Router } from 'express'
import {
  createPayment,
  createCheckoutOrder,
  deletePayment,
  listPayments,
  updatePayment,
  verifyCheckoutPayment,
} from '../controllers/payment.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const paymentRouter = Router()

paymentRouter.use(requireAuth)
paymentRouter.get('/', requirePermission('payments'), listPayments)
paymentRouter.post('/checkout/order', requirePermission('payments'), createCheckoutOrder)
paymentRouter.post('/checkout/verify', requirePermission('payments'), verifyCheckoutPayment)
paymentRouter.post('/', requirePermission('payments'), createPayment)
paymentRouter.patch('/:id', requirePermission('payments'), updatePayment)
paymentRouter.delete('/:id', requirePermission('payments'), deletePayment)
