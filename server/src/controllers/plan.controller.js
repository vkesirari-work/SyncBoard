import { Plan } from '../models/plan.model.js'

export async function listPlans(_request, response, next) {
  try {
    response.json({ plans: await Plan.find().sort({ createdAt: -1 }) })
  } catch (error) {
    next(error)
  }
}

export async function createPlan(request, response, next) {
  try {
    response.status(201).json({ plan: await Plan.create(request.body) })
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
    response.json({ plan })
  } catch (error) {
    next(error)
  }
}

export async function deletePlan(request, response, next) {
  try {
    const plan = await Plan.findByIdAndDelete(request.params.id)
    if (!plan) return response.status(404).json({ message: 'Plan not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
