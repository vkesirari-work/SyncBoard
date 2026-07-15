import { describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const createRoot = vi.fn(() => ({ render }))

vi.mock('react-dom/client', () => ({ createRoot }))
vi.mock('./App.jsx', () => ({ default: () => <div>Sirari Fitness</div> }))

describe('application bootstrap', () => {
  it('creates the React root and renders the app', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import('./main.jsx')

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'))
    expect(render).toHaveBeenCalledOnce()
  })
})
