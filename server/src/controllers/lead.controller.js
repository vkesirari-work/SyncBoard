import { Lead } from '../models/lead.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'

const publicLeadFields = ['name', 'phone', 'email', 'fitnessGoal', 'message']
const adminLeadFields = [...publicLeadFields, 'source', 'status']

function pickLeadFields(body, fields) {
  return Object.fromEntries(fields.filter((field) => body?.[field] !== undefined).map((field) => [field, body[field]]))
}

export function sanitizeLeadInput(body, { isPublic = false } = {}) {
  const values = pickLeadFields(body, isPublic ? publicLeadFields : adminLeadFields)
  return isPublic ? { ...values, source: 'website', status: 'new' } : values
}

async function createLeadRecord(request, response, next, isPublic) {
  try {
    const lead = await Lead.create(sanitizeLeadInput(request.body, { isPublic }))
    emitDashboardUpdate(request, 'lead:created', lead)
    response.status(201).json({ lead })
  } catch (error) {
    next(error)
  }
}

export function createPublicLead(request, response, next) {
  return createLeadRecord(request, response, next, true)
}

export function createLead(request, response, next) {
  return createLeadRecord(request, response, next, false)
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
    emitDashboardUpdate(request, 'lead:updated', lead)
    response.json({ lead })
  } catch (error) {
    next(error)
  }
}

export async function deleteLead(request, response, next) {
  try {
    const lead = await Lead.findByIdAndDelete(request.params.id)
    if (!lead) return response.status(404).json({ message: 'Lead not found' })
    emitDashboardUpdate(request, 'lead:deleted', lead)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
