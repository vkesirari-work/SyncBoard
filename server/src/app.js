import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { memberRouter } from './routes/member.routes.js'
import { planRouter } from './routes/plan.routes.js'

export const app = express()

app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/members', memberRouter)
app.use('/api/plans', planRouter)

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
