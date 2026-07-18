import dotenv from 'dotenv'

dotenv.config({ path: ['.env.local', '.env'] })

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sirari_fitness',
  clientUrls: (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  dnsServers: (process.env.DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean),
}

export function validateProductionEnv(config = env, source = process.env) {
  if (config.nodeEnv !== 'production') return

  const errors = []
  if (!source.MONGODB_URI) errors.push('MONGODB_URI is required')
  if (!source.CLIENT_URLS && !source.CLIENT_URL) errors.push('CLIENT_URLS or CLIENT_URL is required')
  if (!source.JWT_SECRET || config.jwtSecret === 'development-only-secret-change-me' || (config.jwtSecret?.length || 0) < 32) {
    errors.push('JWT_SECRET must be an explicit secret of at least 32 characters')
  }
  if (!config.clientUrls.length) errors.push('At least one client URL is required')

  if (errors.length) throw new Error(`Invalid production environment: ${errors.join('; ')}`)
}
