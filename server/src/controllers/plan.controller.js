import { Plan } from '../models/plan.model.js'
import { Member } from '../models/member.model.js'
import { Payment } from '../models/payment.model.js'

export async function listPlans(_request, response, next) {
  try {
    response.json({ plans: await Plan.find().sort({ createdAt: -1 }) })
  } catch (error) {
    next(error)
  }
}

export async function createPlan(request, response, next) {
  try {
    const plan = await Plan.create(request.body)
    request.app.get('io')?.emit('plan:created', plan)
    response.status(201).json({ plan })
  } catch (error) {
    next(error)
  }
}

export async function updatePlan(request, response, next) {
  try {
    const plan = await Plan.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    })

    if (!plan) return response.status(404).json({ message: 'Plan not found' })
    request.app.get('io')?.emit('plan:updated', plan)
    response.json({ plan })
  } catch (error) {
    next(error)
  }
}

export async function deletePlan(request, response, next) {
  try {
    const [memberCount, paymentCount] = await Promise.all([
      Member.countDocuments({ plan: request.params.id }),
      Payment.countDocuments({ plan: request.params.id }),
    ])

    if (memberCount || paymentCount) {
      return response.status(409).json({
        message: 'Plan is linked to member or payment history and cannot be deleted. Mark it inactive instead.',
      })
    }

    const plan = await Plan.findByIdAndDelete(request.params.id)
    if (!plan) return response.status(404).json({ message: 'Plan not found' })
    request.app.get('io')?.emit('plan:deleted', { id: plan.id })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
