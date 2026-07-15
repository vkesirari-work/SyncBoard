import { User } from '../models/user.model.js'
import { createToken, publicUser } from '../utils/auth.js'
import { Trainer } from '../models/trainer.model.js'
import { Member } from '../models/member.model.js'

export async function register(request, response, next) {
  try {
    const { name, email, password } = request.body

    if (!name || !email || !password) {
      return response.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 8) {
      return response.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return response.status(409).json({ message: 'An account with this email already exists' })
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: 'admin' })

    response.status(201).json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
      return response.status(401).json({ message: 'Invalid email or password' })
    }

    if (user.role === 'trainer') {
      const trainer = await Trainer.findById(user.trainerProfile).select('isActive')
      if (!trainer?.isActive) return response.status(403).json({ message: 'Trainer account is inactive. Contact the gym admin.' })
    }
    if (user.role === 'member') {
      const member = await Member.findById(user.memberProfile).select('_id')
      if (!member) return response.status(403).json({ message: 'Member profile is unavailable. Contact the gym admin.' })
    }

    response.json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
}

export function getCurrentUser(request, response) {
  response.json({ user: publicUser(request.user) })
}
