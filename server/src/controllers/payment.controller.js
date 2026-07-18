import { createHmac } from 'node:crypto'
import { env } from '../config/env.js'
import { Member } from '../models/member.model.js'
import { Payment } from '../models/payment.model.js'
import { Plan } from '../models/plan.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'

function razorpayAuthorization() {
  return `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString('base64')}`
}

const manualCreateFields = new Set(['member', 'plan', 'amount', 'method', 'status', 'paidAt', 'reference', 'notes'])
const manualUpdateFields = new Set(['member', 'plan', 'amount', 'method', 'status', 'paidAt', 'reference', 'notes'])
const manualStatuses = new Set(['paid', 'pending', 'failed'])

export function pickAllowedPaymentFields(body, allowedFields) {
  const keys = Object.keys(body || {})
  const rejected = keys.filter((key) => !allowedFields.has(key))
  if (rejected.length) {
    const error = new Error(`Payment fields cannot be changed: ${rejected.join(', ')}`)
    error.status = 400
    throw error
  }
  return Object.fromEntries(keys.map((key) => [key, body[key]]))
}

async function validateManualPaymentReferences(values) {
  const [member, plan] = await Promise.all([
    values.member ? Member.exists({ _id: values.member }) : null,
    values.plan ? Plan.exists({ _id: values.plan }) : null,
  ])
  if (values.member && !member) {
    const error = new Error('Select a valid member')
    error.status = 400
    throw error
  }
  if (values.plan && !plan) {
    const error = new Error('Select a valid plan')
    error.status = 400
    throw error
  }
}

function validateManualStatus(status) {
  if (status && !manualStatuses.has(status)) {
    const error = new Error('Manual payments can only be paid, pending, or failed')
    error.status = 400
    throw error
  }
}

export async function createCheckoutOrder(request, response, next) {
  try {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) return response.status(503).json({ message: 'Online payments are not configured' })
    const [member, plan] = await Promise.all([Member.findById(request.body.member), Plan.findById(request.body.plan)])
    if (!member || !plan || !plan.isActive) return response.status(400).json({ message: 'Select a valid member and active plan' })
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: razorpayAuthorization(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(plan.price * 100), currency: 'INR', receipt: `sf_${Date.now()}`, notes: { member: member.id, plan: plan.id } }),
    })
    const order = await orderResponse.json()
    if (!orderResponse.ok) return response.status(502).json({ message: order.error?.description || 'Could not create payment order' })
    response.json({ keyId: env.razorpayKeyId, order, member: { id: member.id, name: member.name, email: member.email, phone: member.phone }, plan: { id: plan.id, name: plan.name } })
  } catch (error) { next(error) }
}

export async function verifyCheckoutPayment(request, response, next) {
  try {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) return response.status(503).json({ message: 'Online payments are not configured' })
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature, member, plan } = request.body
    if (!orderId || !paymentId || !member || !plan) return response.status(400).json({ message: 'Complete payment verification details are required' })
    const expected = createHmac('sha256', env.razorpayKeySecret).update(`${orderId}|${paymentId}`).digest('hex')
    if (!signature || expected !== signature) return response.status(400).json({ message: 'Payment signature verification failed' })
    const [gatewayResponse, orderResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, { headers: { Authorization: razorpayAuthorization() } }),
      fetch(`https://api.razorpay.com/v1/orders/${orderId}`, { headers: { Authorization: razorpayAuthorization() } }),
    ])
    const [gatewayPayment, gatewayOrder] = await Promise.all([gatewayResponse.json(), orderResponse.json()])
    if (!gatewayResponse.ok || !orderResponse.ok || gatewayPayment.order_id !== orderId || gatewayOrder.notes?.member !== member || gatewayOrder.notes?.plan !== plan || gatewayPayment.amount !== gatewayOrder.amount) {
      return response.status(400).json({ message: 'Could not verify payment details with Razorpay' })
    }
    const method = ['upi', 'card'].includes(gatewayPayment.method) ? gatewayPayment.method : gatewayPayment.method === 'netbanking' ? 'bank_transfer' : 'other'
    const payment = await Payment.findOneAndUpdate(
      { gatewayPaymentId: paymentId },
      { member, plan, amount: gatewayPayment.amount / 100, method, status: gatewayPayment.status === 'captured' ? 'paid' : 'pending', paidAt: new Date(gatewayPayment.created_at * 1000), reference: paymentId, gateway: 'razorpay', gatewayOrderId: orderId, gatewayPaymentId: paymentId, notes: 'Razorpay verified checkout' },
      { new: true, upsert: true, runValidators: true },
    ).populate('member', 'name phone').populate('plan', 'name durationMonths')
    emitDashboardUpdate(request, 'payment:created', payment)
    response.json({ payment })
  } catch (error) { next(error) }
}

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
    const values = pickAllowedPaymentFields(request.body, manualCreateFields)
    validateManualStatus(values.status)
    await validateManualPaymentReferences(values)
    const payment = await Payment.create({ ...values, gateway: 'manual' })
    await payment.populate([
      { path: 'member', select: 'name phone' },
      { path: 'plan', select: 'name durationMonths' },
    ])
    emitDashboardUpdate(request, 'payment:created', payment)
    response.status(201).json({ payment })
  } catch (error) {
    next(error)
  }
}

export async function updatePayment(request, response, next) {
  try {
    const existing = await Payment.findById(request.params.id).select('gateway status')
    if (!existing) return response.status(404).json({ message: 'Payment not found' })
    if (existing.gateway !== 'manual') return response.status(409).json({ message: 'Gateway payments are read-only and must be reconciled with the payment provider' })
    if (['paid', 'refunded'].includes(existing.status)) return response.status(409).json({ message: 'Paid or refunded payment history cannot be edited' })

    const values = pickAllowedPaymentFields(request.body, manualUpdateFields)
    validateManualStatus(values.status)
    await validateManualPaymentReferences(values)
    const payment = await Payment.findOneAndUpdate(
      { _id: request.params.id, gateway: 'manual', status: { $nin: ['paid', 'refunded'] } },
      values,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate('member', 'name phone')
      .populate('plan', 'name durationMonths')

    if (!payment) return response.status(409).json({ message: 'Payment changed while editing. Refresh and try again.' })
    emitDashboardUpdate(request, 'payment:updated', payment)
    response.json({ payment })
  } catch (error) {
    next(error)
  }
}

export async function deletePayment(request, response, next) {
  try {
    const payment = await Payment.findById(request.params.id)
    if (!payment) return response.status(404).json({ message: 'Payment not found' })
    if (payment.gateway !== 'manual') {
      return response.status(409).json({ message: 'Gateway payment history cannot be deleted' })
    }
    if (payment.status === 'paid' || payment.status === 'refunded') {
      return response.status(409).json({
        message: 'Paid or refunded transactions cannot be deleted. Mark a paid transaction as refunded to preserve history.',
      })
    }

    await payment.deleteOne()
    emitDashboardUpdate(request, 'payment:deleted', payment)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
