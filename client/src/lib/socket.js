import { io } from 'socket.io-client'
import { resolveServiceUrl } from './runtime-config'

let socket

export function getSocket() {
  if (!socket) {
    const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const socketUrl = resolveServiceUrl({
      configured: import.meta.env.VITE_SOCKET_URL,
      isLocal: isLocalBrowser,
      localFallback: 'http://localhost:5001',
      name: 'VITE_SOCKET_URL',
    })

    socket = io(socketUrl, {
      autoConnect: false,
      auth: { token: localStorage.getItem('authToken') },
    })
  }

  return socket
}

export function connectSocket(token) {
  const sharedSocket = getSocket()
  sharedSocket.auth = { token: token || localStorage.getItem('authToken') }
  if (!sharedSocket.connected) sharedSocket.connect()
  return sharedSocket
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}
