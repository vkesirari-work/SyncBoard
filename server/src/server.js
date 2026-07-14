import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { app } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'

const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrls,
    credentials: true,
  },
})

app.set('io', io)

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)
})

async function startServer() {
  httpServer.listen(env.port, () => {
    console.log(`API running at http://localhost:${env.port}`)
  })

  try {
    await connectDatabase(env.mongodbUri)
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`)
  }
}

startServer()
