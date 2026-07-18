import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSocket = { id: 'socket-1', connected: false, auth: {}, connect: vi.fn(), disconnect: vi.fn() }
const io = vi.fn(() => mockSocket)

vi.unmock('./socket')
vi.mock('socket.io-client', () => ({ io }))

describe('socket client', () => {
  beforeEach(() => {
    vi.resetModules()
    io.mockClear()
    mockSocket.connected = false
    mockSocket.auth = {}
    mockSocket.connect.mockClear()
    mockSocket.disconnect.mockClear()
  })

  it('creates one lazy local socket and reuses it', async () => {
    const { getSocket } = await import('./socket')
    const first = getSocket()
    const second = getSocket()

    expect(io).toHaveBeenCalledOnce()
    expect(io).toHaveBeenCalledWith('http://localhost:5001', { autoConnect: false, auth: { token: null } })
    expect(second).toBe(first)
  })

  it('attaches the current token when the dashboard owns the connection', async () => {
    const { connectSocket, disconnectSocket } = await import('./socket')
    connectSocket('secure-token')

    expect(mockSocket.auth).toEqual({ token: 'secure-token' })
    expect(mockSocket.connect).toHaveBeenCalledOnce()

    mockSocket.connected = true
    disconnectSocket()
    expect(mockSocket.disconnect).toHaveBeenCalledOnce()
  })
})
