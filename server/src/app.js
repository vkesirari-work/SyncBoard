import cors from 'cors'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { attendanceRouter } from './routes/attendance.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { leadRouter } from './routes/lead.routes.js'
import { memberRouter } from './routes/member.routes.js'
import { paymentRouter } from './routes/payment.routes.js'
import { planRouter } from './routes/plan.routes.js'
import { trainerRouter } from './routes/trainer.routes.js'
import { settingsRouter } from './routes/settings.routes.js'
import { notificationRouter } from './routes/notification.routes.js'
import { trainingSessionRouter } from './routes/training-session.routes.js'
import { trainerLeaveRouter } from './routes/trainer-leave.routes.js'
import { auditMutations } from './middleware/audit.middleware.js'
import { staffRouter } from './routes/staff.routes.js'
import { memberProgressRouter } from './routes/member-progress.routes.js'

export const app = express()

app.set('trust proxy', 1)
app.use((request, response, next) => {
  request.requestId = request.get('X-Request-ID') || randomUUID()
  response.set('X-Request-ID', request.requestId)
  next()
})
app.use(cors({ origin: env.clientUrls, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(auditMutations)

app.get('/', (_request, response) => {
  response.json({
    name: 'Sirari Fitness API',
    status: 'running',
    health: '/api/health',
    message: 'Backend is online. Open the frontend to use the application.',
  })
})

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/members', memberRouter)
app.use('/api/plans', planRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/leads', leadRouter)
app.use('/api/trainers', trainerRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/training-sessions', trainingSessionRouter)
app.use('/api/trainer-leaves', trainerLeaveRouter)
app.use('/api/staff', staffRouter)
app.use('/api/member-progress', memberProgressRouter)

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` })
})

export function errorHandler(error, request, response, _next) {
  console.error(`[${request.requestId || 'no-request-id'}]`, error)

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ message: error.message })
  }

  if (error.code === 11000) {
    return response.status(409).json({ message: 'A record with this value already exists' })
  }

  const status = error.status || 500
  const hideDetails = status >= 500 && env.nodeEnv === 'production'
  return response.status(status).json({
    message: hideDetails ? 'Internal server error' : error.message || 'Internal server error',
    ...(status >= 500 && request.requestId ? { requestId: request.requestId } : {}),
  })
}

app.use(errorHandler)
