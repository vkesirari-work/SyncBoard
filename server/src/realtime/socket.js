import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/user.model.js'

export const authenticatedDashboardRoom = 'dashboard:authenticated'

function bearerToken(socket) {
  const authToken = socket.handshake?.auth?.token
  if (authToken) return authToken
  const authorization = socket.handshake?.headers?.authorization
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
}

export async function authenticateSocket(socket, next) {
  try {
    const token = bearerToken(socket)
    if (!token) return next(new Error('Authentication required'))

    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.sub).select('role permissions isActive +tokenVersion')
    if (!user || user.isActive === false) return next(new Error('Account unavailable'))
    if (payload.ver !== (user.tokenVersion || 0)) return next(new Error('Session unavailable'))

    socket.data.user = user
    next()
  } catch {
    next(new Error('Invalid or expired token'))
  }
}

export function configureAuthenticatedSockets(io) {
  io.use(authenticateSocket)
  io.on('connection', (socket) => {
    const user = socket.data.user
    socket.join(authenticatedDashboardRoom)
    socket.join(`role:${user.role}`)
    socket.join(`user:${user.id}`)
  })
}

export function emitDashboardUpdate(request, event, resource = {}) {
  const id = resource?.id || resource?._id
  const payload = id ? { id: String(id) } : {}
  request.app.get('io')?.to(authenticatedDashboardRoom).emit(event, payload)
}
