import { defaultStaffPermissions, staffPermissions } from '../config/permissions.js'
import { AuditLog } from '../models/audit-log.model.js'
import { User } from '../models/user.model.js'
import { publicUser } from '../utils/auth.js'

function normalizedPermissions(values) {
  const selected = (Array.isArray(values) ? values : defaultStaffPermissions).filter((permission) => staffPermissions.includes(permission))
  return [...new Set(['dashboard', ...selected])]
}

export async function listStaff(_request, response, next) {
  try {
    const staff = await User.find({ role: 'staff' }).sort({ createdAt: -1 })
    response.json({ staff: staff.map(publicUser), availablePermissions: staffPermissions })
  } catch (error) { next(error) }
}

export async function createStaff(request, response, next) {
  try {
    const { name, email, password } = request.body
    if (!name?.trim() || !email?.trim() || !password) return response.status(400).json({ message: 'Name, email, and password are required' })
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
    const normalizedEmail = email.trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) return response.status(409).json({ message: 'This email is already used by another account' })
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: 'staff', permissions: normalizedPermissions(request.body.permissions), isActive: true })
    response.status(201).json({ staff: publicUser(user) })
  } catch (error) { next(error) }
}

export async function updateStaff(request, response, next) {
  try {
    const user = await User.findOne({ _id: request.params.id, role: 'staff' })
    if (!user) return response.status(404).json({ message: 'Staff account not found' })
    if (request.body.name !== undefined) user.name = request.body.name.trim()
    if (request.body.email !== undefined) user.email = request.body.email.trim().toLowerCase()
    if (request.body.permissions !== undefined) user.permissions = normalizedPermissions(request.body.permissions)
    if (request.body.isActive !== undefined) user.isActive = Boolean(request.body.isActive)
    await user.save()
    response.json({ staff: publicUser(user) })
  } catch (error) { next(error) }
}

export async function resetStaffPassword(request, response, next) {
  try {
    const password = request.body.password || ''
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
    const user = await User.findOne({ _id: request.params.id, role: 'staff' }).select('+password')
    if (!user) return response.status(404).json({ message: 'Staff account not found' })
    user.password = password
    await user.save()
    response.json({ message: 'Staff password reset successfully' })
  } catch (error) { next(error) }
}

export async function listAuditLogs(request, response, next) {
  try {
    const limit = Math.min(Math.max(Number(request.query.limit) || 100, 1), 300)
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit)
    response.json({ logs })
  } catch (error) { next(error) }
}
