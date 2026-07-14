import { Lead } from '../models/lead.model.js'

export async function createLead(request, response, next) {
  try {
    const lead = await Lead.create(request.body)
    request.app.get('io')?.emit('lead:created', lead)
    response.status(201).json({ lead })
  } catch (error) {
    next(error)
  }
}

export async function listLeads(request, response, next) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {}
    response.json({ leads: await Lead.find(filter).sort({ createdAt: -1 }) })
  } catch (error) {
    next(error)
  }
}

export async function updateLead(request, response, next) {
  try {
    const lead = await Lead.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    })

    if (!lead) return response.status(404).json({ message: 'Lead not found' })
    request.app.get('io')?.emit('lead:updated', lead)
    response.json({ lead })
  } catch (error) {
    next(error)
  }
}
