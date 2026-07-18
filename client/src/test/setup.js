import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

const socket = {
  on: vi.fn(), off: vi.fn(), connect: vi.fn(), disconnect: vi.fn(), emit: vi.fn(),
}

vi.mock('../lib/socket', () => ({
  getSocket: () => socket,
  connectSocket: vi.fn(() => socket),
  disconnectSocket: vi.fn(),
}))
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn(),
  },
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
class IntersectionObserverMock { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver = ResizeObserverMock
globalThis.IntersectionObserver = IntersectionObserverMock
window.scrollTo = vi.fn()

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

afterEach(() => cleanup())
