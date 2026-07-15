import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TaskModal from './TaskModal'

describe('TaskModal', () => {
  it('validates and creates a member note in the chosen board column', () => {
    const onCreate = vi.fn(); const onClose = vi.fn(); render(<TaskModal columns={[{ id: 'new', title: 'New' }]} onCreate={onCreate} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /add note/i })); expect(screen.getByText(/member note is required/i)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Member note' }), { target: { value: 'Call member tomorrow' } }); fireEvent.click(screen.getByRole('button', { name: /add note/i }))
    expect(onCreate).toHaveBeenCalledWith('new', expect.objectContaining({ title: 'Call member tomorrow', priority: 'Medium' })); expect(onClose).toHaveBeenCalled()
  })
})
