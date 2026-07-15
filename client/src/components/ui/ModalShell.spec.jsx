import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ModalShell from './ModalShell'

describe('ModalShell', () => {
  it('closes on Escape unless a save is in progress', () => {
    const onClose = vi.fn(); const { rerender } = render(<ModalShell labelledBy="title" onClose={onClose}><h2 id="title">Test modal</h2></ModalShell>)
    fireEvent.keyDown(window, { key: 'Escape' }); expect(onClose).toHaveBeenCalledOnce()
    onClose.mockClear(); rerender(<ModalShell labelledBy="title" onClose={onClose} isBusy><h2 id="title">Test modal</h2></ModalShell>); fireEvent.keyDown(window, { key: 'Escape' }); expect(onClose).not.toHaveBeenCalled(); expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
