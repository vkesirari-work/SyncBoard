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
    const user = await User.findById(payload.sub)

    if (!user) {
      return response.status(401).json({ message: 'User no longer exists' })
    }

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
