import { Attendance } from '../models/attendance.model.js'
import { Member } from '../models/member.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'
import { escapedSearch, paginationMeta, parsePagination, wantsPagination } from '../utils/pagination.js'

const attendanceFields = ['member', 'checkIn', 'checkOut', 'notes']

export function sanitizeAttendanceInput(body, { checkInOnly = false } = {}) {
  const allowed = checkInOnly ? attendanceFields.filter((field) => field !== 'checkOut') : attendanceFields
  return Object.fromEntries(allowed.filter((field) => body?.[field] !== undefined).map((field) => [field, body[field]]))
}

export function validateAttendanceTimeline(checkInValue, checkOutValue, now = new Date()) {
  const checkIn = new Date(checkInValue)
  const checkOut = checkOutValue ? new Date(checkOutValue) : null
  if (Number.isNaN(checkIn.getTime())) {
    const error = new Error('Enter a valid check-in time')
    error.status = 400
    throw error
  }
  if (checkIn.getTime() > now.getTime() + 5 * 60_000) {
    const error = new Error('Check-in time cannot be in the future')
    error.status = 400
    throw error
  }
  if (checkOut && (Number.isNaN(checkOut.getTime()) || checkOut < checkIn)) {
    const error = new Error('Check-out time must be after check-in')
    error.status = 400
    throw error
  }
}

async function requireMember(memberId) {
  if (!memberId || !(await Member.exists({ _id: memberId }))) {
    const error = new Error('Select a valid member')
    error.status = 400
    throw error
  }
}

export async function listAttendance(request, response, next) {
  try {
    const filter = request.query.member ? { member: request.query.member } : {}
    if (request.query.inside === 'true') filter.checkOut = null
    const search = escapedSearch(request.query.q)
    if (search) {
      const memberIds = await Member.find({ $or: [{ name: search }, { phone: search }] }).distinct('_id')
      filter.$or = [{ member: { $in: memberIds } }, { notes: search }]
    }
    const query = Attendance.find(filter)
      .populate('member', 'name phone')
      .sort({ checkIn: -1 })
    if (!wantsPagination(request.query)) return response.json({ attendance: await query })
    const { page, limit, skip } = parsePagination(request.query)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [attendance, total, allCount, todayCount, insideMemberIds] = await Promise.all([
      query.skip(skip).limit(limit),
      Attendance.countDocuments(filter),
      Attendance.countDocuments(),
      Attendance.countDocuments({ checkIn: { $gte: today } }),
      Attendance.distinct('member', { checkOut: null }),
    ])
    response.json({
      attendance,
      pagination: paginationMeta(total, page, limit),
      summary: { total: allCount, today: todayCount, inside: insideMemberIds.length, insideMemberIds },
    })
  } catch (error) {
    next(error)
  }
}

export async function checkIn(request, response, next) {
  try {
    const values = sanitizeAttendanceInput(request.body, { checkInOnly: true })
    await requireMember(values.member)
    values.checkIn ||= new Date()
    validateAttendanceTimeline(values.checkIn, null)
    const openVisit = await Attendance.findOne({ member: values.member, checkOut: null })
    if (openVisit) {
      return response.status(409).json({ message: 'Member is already checked in' })
    }

    const attendance = await Attendance.create(values)
    await attendance.populate('member', 'name phone')
    emitDashboardUpdate(request, 'attendance:check-in', attendance)
    response.status(201).json({ attendance })
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ message: 'Member is already checked in' })
    next(error)
  }
}

export async function checkOut(request, response, next) {
  try {
    const attendance = await Attendance.findOne({ _id: request.params.id, checkOut: null })

    if (!attendance) {
      return response.status(404).json({ message: 'Active attendance record not found' })
    }

    const checkOutAt = new Date()
    validateAttendanceTimeline(attendance.checkIn, checkOutAt)
    attendance.checkOut = checkOutAt
    await attendance.save()
    await attendance.populate('member', 'name phone')

    emitDashboardUpdate(request, 'attendance:check-out', attendance)
    response.json({ attendance })
  } catch (error) {
    next(error)
  }
}

export async function updateAttendance(request, response, next) {
  try {
    const attendance = await Attendance.findById(request.params.id)
    if (!attendance) return response.status(404).json({ message: 'Attendance record not found' })
    const values = sanitizeAttendanceInput(request.body)
    const member = values.member || attendance.member
    await requireMember(member)
    validateAttendanceTimeline(values.checkIn || attendance.checkIn, values.checkOut === undefined ? attendance.checkOut : values.checkOut)
    attendance.set(values)
    await attendance.save()
    await attendance.populate('member', 'name phone')
    emitDashboardUpdate(request, 'attendance:updated', attendance)
    response.json({ attendance })
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ message: 'Member is already checked in' })
    next(error)
  }
}

export async function deleteAttendance(request, response, next) {
  try {
    const attendance = await Attendance.findByIdAndDelete(request.params.id)
    if (!attendance) return response.status(404).json({ message: 'Attendance record not found' })
    emitDashboardUpdate(request, 'attendance:deleted', attendance)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
