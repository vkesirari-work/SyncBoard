import { Payment } from '../models/payment.model.js'

export async function listPayments(request, response, next) {
  try {
    const filter = request.query.member ? { member: request.query.member } : {}
    const payments = await Payment.find(filter)
      .populate('member', 'name phone')
      .populate('plan', 'name durationMonths')
      .sort({ paidAt: -1 })

    response.json({ payments })
  } catch (error) {
    next(error)
  }
}

export async function createPayment(request, response, next) {
  try {
    const payment = await Payment.create(request.body)
    await payment.populate([
      { path: 'member', select: 'name phone' },
      { path: 'plan', select: 'name durationMonths' },
    ])
    request.app.get('io')?.emit('payment:created', payment)
    response.status(201).json({ payment })
  } catch (error) {
    next(error)
  }
}

export async function updatePayment(request, response, next) {
  try {
    const payment = await Payment.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    })
      .populate('member', 'name phone')
      .populate('plan', 'name durationMonths')

    if (!payment) return response.status(404).json({ message: 'Payment not found' })
    request.app.get('io')?.emit('payment:updated', payment)
    response.json({ payment })
  } catch (error) {
    next(error)
  }
}

export async function deletePayment(request, response, next) {
  try {
    const payment = await Payment.findById(request.params.id)
    if (!payment) return response.status(404).json({ message: 'Payment not found' })
    if (payment.status === 'paid' || payment.status === 'refunded') {
      return response.status(409).json({
        message: 'Paid or refunded transactions cannot be deleted. Mark a paid transaction as refunded to preserve history.',
      })
    }

    await payment.deleteOne()
    request.app.get('io')?.emit('payment:deleted', { id: payment.id })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
