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
