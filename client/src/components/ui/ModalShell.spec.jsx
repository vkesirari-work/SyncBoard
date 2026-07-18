import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ModalShell from './ModalShell'

describe('ModalShell', () => {
  it('closes on Escape unless a save is in progress', () => {
    const onClose = vi.fn(); const { rerender } = render(<ModalShell labelledBy="title" onClose={onClose}><h2 id="title">Test modal</h2></ModalShell>)
    fireEvent.keyDown(window, { key: 'Escape' }); expect(onClose).toHaveBeenCalledOnce()
    onClose.mockClear(); rerender(<ModalShell labelledBy="title" onClose={onClose} isBusy><h2 id="title">Test modal</h2></ModalShell>); fireEvent.keyDown(window, { key: 'Escape' }); expect(onClose).not.toHaveBeenCalled(); expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('moves focus inside, traps Tab, and restores the previously focused control', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const { unmount } = render(
      <ModalShell labelledBy="focus-title" onClose={vi.fn()}>
        <h2 id="focus-title">Focus modal</h2>
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </ModalShell>,
    )

    const first = screen.getByRole('button', { name: 'First action' })
    const last = screen.getByRole('button', { name: 'Last action' })
    expect(first).toHaveFocus()

    last.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(first).toHaveFocus()

    first.focus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('closes only when the backdrop itself is pressed and keeps body scrolling locked', () => {
    const onClose = vi.fn()
    const appRoot = document.createElement('div')
    appRoot.id = 'root'
    document.body.appendChild(appRoot)
    const { unmount } = render(<ModalShell labelledBy="backdrop-title" onClose={onClose}><h2 id="backdrop-title">Backdrop modal</h2></ModalShell>)
    const dialog = screen.getByRole('dialog')

    expect(document.body).toHaveClass('modal-open')
    expect(appRoot).toHaveAttribute('inert')
    expect(appRoot).toHaveAttribute('aria-hidden', 'true')
    fireEvent.mouseDown(dialog)
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseDown(dialog.parentElement)
    expect(onClose).toHaveBeenCalledOnce()

    unmount()
    expect(document.body).not.toHaveClass('modal-open')
    expect(appRoot).not.toHaveAttribute('inert')
    expect(appRoot).not.toHaveAttribute('aria-hidden')
    appRoot.remove()
  })
})
