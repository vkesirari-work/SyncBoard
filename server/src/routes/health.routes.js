import { Router } from 'express'
import mongoose from 'mongoose'

export const healthRouter = Router()

healthRouter.get('/', (_request, response) => {
  const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const database = databaseStates[mongoose.connection.readyState] || 'unknown'
  const ready = mongoose.connection.readyState === 1

  response.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    database,
    timestamp: new Date().toISOString(),
  })
})
