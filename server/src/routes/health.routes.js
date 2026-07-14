import { Router } from 'express'
import mongoose from 'mongoose'

export const healthRouter = Router()

healthRouter.get('/', (_request, response) => {
  const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting']

  response.json({
    status: 'ok',
    database: databaseStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  })
})
