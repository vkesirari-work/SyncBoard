import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { app, errorHandler } from './app.js'
import { env } from './config/env.js'

describe('Sirari Fitness API shell', () => {
  it('describes the API at the root without requiring MongoDB', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200); expect(response.body).toMatchObject({ name: 'Sirari Fitness API', status: 'running', health: '/api/health' })
  })
  it('reports health and the current database state', async () => {
    const response = await request(app).get('/api/health')
    expect([200, 503]).toContain(response.status)
    expect(response.body.status).toBe(response.body.database === 'connected' ? 'ok' : 'unavailable')
    expect(['disconnected', 'connected', 'connecting', 'disconnecting', 'unknown']).toContain(response.body.database)
  })
  it('returns a precise JSON error for unknown routes', async () => {
    const response = await request(app).get('/api/not-a-route')
    expect(response.status).toBe(404); expect(response.body.message).toBe('Route not found: GET /api/not-a-route')
  })
  it('hides unexpected server details in production and returns a request id', () => {
    const previousEnvironment = env.nodeEnv
    try {
      env.nodeEnv = 'production'
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const status = { json: (body) => body }
      const response = { status: (code) => { expect(code).toBe(500); return status } }
      const body = errorHandler(new Error('mongodb private host detail'), { requestId: 'request-1' }, response)
      expect(body).toEqual({ message: 'Internal server error', requestId: 'request-1' })
    } finally {
      env.nodeEnv = previousEnvironment
    }
  })
})
