import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: '7d',
  })
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    trainerProfile: user.trainerProfile || null,
  }
}
