import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../lib/api'
import { renderPage, setupApi } from '../../test/test-utils'
import MemberModal from './MemberModal'

describe('MemberModal', () => {
  beforeEach(() => setupApi())
  it('submits a new member using the members API', async () => {
    api.post.mockResolvedValueOnce({ data: { member: { _id: 'member-1', name: 'New Member' } } }); const onSaved = vi.fn(); const onClose = vi.fn()
    renderPage(<MemberModal onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New Member' } }); fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: '9876543210' } }); fireEvent.click(screen.getByRole('button', { name: /add member/i }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/members', expect.objectContaining({ name: 'New Member', phone: '9876543210' }))); expect(onSaved).toHaveBeenCalled()
  })
})
