import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { healthRouter } from './routes/health.routes.js'

export const app = express()

app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json())

app.use('/api/health', healthRouter)

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  })
})
