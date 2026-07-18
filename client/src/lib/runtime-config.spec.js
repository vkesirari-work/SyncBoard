import { describe, expect, it } from 'vitest'
import { resolveServiceUrl } from './runtime-config'

describe('deployment service URL configuration', () => {
  it('uses explicit deployment URLs and trims a trailing slash', () => {
    expect(resolveServiceUrl({ configured: 'https://api.example.com/api/', isLocal: false, localFallback: 'local', name: 'API' })).toBe('https://api.example.com/api')
  })

  it('allows the local development fallback but fails closed for a misconfigured deployment', () => {
    expect(resolveServiceUrl({ configured: '', isLocal: true, localFallback: 'http://localhost:5001/api', name: 'API' })).toBe('http://localhost:5001/api')
    expect(() => resolveServiceUrl({ configured: '', isLocal: false, localFallback: 'local', name: 'API' })).toThrow(/not configured/)
  })
})
