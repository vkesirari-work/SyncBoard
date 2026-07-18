import { describe, expect, it } from 'vitest'
import { validateProductionEnv } from './env.js'

const validConfig = {
  nodeEnv: 'production',
  mongodbUri: 'mongodb://example',
  clientUrls: ['https://example.com'],
  jwtSecret: 'a-secure-production-secret-with-32-chars',
}

describe('production environment validation', () => {
  it('rejects missing production secrets and connection settings', () => {
    expect(() => validateProductionEnv({ ...validConfig, jwtSecret: 'short' }, {})).toThrow(/MONGODB_URI.*CLIENT_URLS.*JWT_SECRET/)
  })

  it('accepts explicit secure production settings and skips development', () => {
    expect(() => validateProductionEnv(validConfig, {
      MONGODB_URI: validConfig.mongodbUri,
      CLIENT_URL: validConfig.clientUrls[0],
      JWT_SECRET: validConfig.jwtSecret,
    })).not.toThrow()
    expect(() => validateProductionEnv({ ...validConfig, nodeEnv: 'test' }, {})).not.toThrow()
  })
})
