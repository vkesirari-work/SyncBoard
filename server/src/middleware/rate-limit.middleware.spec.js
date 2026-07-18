import { describe, expect, it, vi } from 'vitest'
import { createRateLimiter } from './rate-limit.middleware.js'

function responseMock() {
  const response = { set: vi.fn(), status: vi.fn(), json: vi.fn() }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

describe('rate limiter', () => {
  it('allows the configured request count then returns 429', () => {
    const limiter = createRateLimiter({ name: `test-${Date.now()}`, windowMs: 60_000, limit: 2 })
    const request = { ip: '127.0.0.10' }
    const response = responseMock()
    const next = vi.fn()

    limiter(request, response, next)
    limiter(request, response, next)
    limiter(request, response, next)

    expect(next).toHaveBeenCalledTimes(2)
    expect(response.status).toHaveBeenCalledWith(429)
    expect(response.set).toHaveBeenCalledWith('Retry-After', expect.any(String))
  })
})
