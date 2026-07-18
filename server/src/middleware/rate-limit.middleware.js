const stores = new Map()

function clientKey(request) {
  return request.ip || request.socket?.remoteAddress || 'unknown'
}

export function createRateLimiter({ name, windowMs, limit }) {
  const store = stores.get(name) || new Map()
  stores.set(name, store)

  return (request, response, next) => {
    const now = Date.now()
    const key = clientKey(request)
    const previous = store.get(key)
    const entry = !previous || previous.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : previous

    entry.count += 1
    store.set(key, entry)
    response.set('RateLimit-Limit', String(limit))
    response.set('RateLimit-Remaining', String(Math.max(0, limit - entry.count)))
    response.set('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > limit) {
      response.set('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))))
      return response.status(429).json({ message: 'Too many requests. Please try again later.' })
    }

    // Opportunistic cleanup keeps this dependency-free limiter bounded in normal use.
    if (store.size > 10_000) {
      for (const [storedKey, value] of store) {
        if (value.resetAt <= now) store.delete(storedKey)
      }
    }
    next()
  }
}

export const authRateLimit = createRateLimiter({ name: 'auth', windowMs: 15 * 60_000, limit: 20 })
export const publicLeadRateLimit = createRateLimiter({ name: 'public-leads', windowMs: 60 * 60_000, limit: 10 })

export function clearRateLimitStores() {
  for (const store of stores.values()) store.clear()
  stores.clear()
}
