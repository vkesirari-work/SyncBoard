import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sirari_fitness',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
}
