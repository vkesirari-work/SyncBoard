import { beforeEach, describe, expect, it, vi } from 'vitest'

const io = vi.fn(() => ({ id: 'socket-1' }))

vi.unmock('./socket')
vi.mock('socket.io-client', () => ({ io }))

describe('socket client', () => {
  beforeEach(() => {
    vi.resetModules()
    io.mockClear()
  })

  it('creates one lazy local socket and reuses it', async () => {
    const { getSocket } = await import('./socket')
    const first = getSocket()
    const second = getSocket()

    expect(io).toHaveBeenCalledOnce()
    expect(io).toHaveBeenCalledWith('http://localhost:5001', { autoConnect: false })
    expect(second).toBe(first)
  })
})
