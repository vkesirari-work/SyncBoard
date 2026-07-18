import { Lead } from '../models/lead.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'
import { escapedSearch, paginationMeta, parsePagination, wantsPagination } from '../utils/pagination.js'

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
    const search = escapedSearch(request.query.q)
    if (search) filter.$or = [{ name: search }, { phone: search }, { email: search }, { fitnessGoal: search }, { source: search }, { message: search }]
    const query = Lead.find(filter).sort({ createdAt: -1 })
    if (!wantsPagination(request.query)) return response.json({ leads: await query })
    const { page, limit, skip } = parsePagination(request.query, { defaultLimit: 48, maxLimit: 100 })
    const [leads, total, countRows] = await Promise.all([
      query.skip(skip).limit(limit),
      Lead.countDocuments(filter),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ])
    const counts = Object.fromEntries(countRows.map((row) => [row._id, row.count]))
    response.json({ leads, pagination: paginationMeta(total, page, limit), counts })
  } catch (error) {
    next(error)
  }
}

export async function updateLead(request, response, next) {
  try {
    const lead = await Lead.findByIdAndUpdate(request.params.id, sanitizeLeadInput(request.body), {
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
