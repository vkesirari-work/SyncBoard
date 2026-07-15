import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from './app.js'

describe('Sirari Fitness API shell', () => {
  it('describes the API at the root without requiring MongoDB', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200); expect(response.body).toMatchObject({ name: 'Sirari Fitness API', status: 'running', health: '/api/health' })
  })
  it('reports health and the current database state', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200); expect(response.body.status).toBe('ok'); expect(['disconnected', 'connected', 'connecting', 'disconnecting', 'unknown']).toContain(response.body.database)
  })
  it('returns a precise JSON error for unknown routes', async () => {
    const response = await request(app).get('/api/not-a-route')
    expect(response.status).toBe(404); expect(response.body.message).toBe('Route not found: GET /api/not-a-route')
  })
})
