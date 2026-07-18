import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/user.model.js'

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.get('authorization')
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

    if (!token) {
      return response.status(401).json({ message: 'Authentication required' })
    }

    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.sub).select('+tokenVersion')

    if (!user) {
      return response.status(401).json({ message: 'User no longer exists' })
    }
    if (payload.ver !== (user.tokenVersion || 0)) {
      return response.status(401).json({ message: 'This session is no longer valid. Sign in again.' })
    }
    if (user.isActive === false) return response.status(403).json({ message: 'This account is disabled. Contact the gym owner.' })

    request.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Invalid or expired token' })
    }

    next(error)
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission' })
    }

    next()
  }
}

export function requirePermission(permission, ...extraRoles) {
  return (request, response, next) => {
    if (['admin', 'user'].includes(request.user.role) || extraRoles.includes(request.user.role)) return next()
    if (request.user.role === 'staff' && request.user.permissions?.includes(permission)) return next()
    return response.status(403).json({ message: 'You do not have permission' })
  }
}

export function requireAnyPermission(permissions, ...extraRoles) {
  return (request, response, next) => {
    if (['admin', 'user'].includes(request.user.role) || extraRoles.includes(request.user.role)) return next()
    if (request.user.role === 'staff' && permissions.some((permission) => request.user.permissions?.includes(permission))) return next()
    return response.status(403).json({ message: 'You do not have permission' })
  }
}
