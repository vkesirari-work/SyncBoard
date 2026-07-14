import { io } from 'socket.io-client'

let socket

export function getSocket() {
  if (!socket) {
    const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const defaultSocketUrl = isLocalBrowser
      ? 'http://localhost:5001'
      : 'https://sirari-fitness-api.onrender.com'

    socket = io(import.meta.env.VITE_SOCKET_URL || defaultSocketUrl, {
      autoConnect: false,
    })
  }

  return socket
}
