import cors from 'cors'
import express from 'express'
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

export const app = express()

app.use(cors({ origin: env.clientUrls, credentials: true }))
app.use(express.json())

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

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` })
})

app.use((error, _request, response, _next) => {
  console.error(error)

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ message: error.message })
  }

  if (error.code === 11000) {
    return response.status(409).json({ message: 'A record with this value already exists' })
  }

  response.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  })
})
