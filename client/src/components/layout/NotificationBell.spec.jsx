import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderPage, setupApi } from '../../test/test-utils'
import NotificationBell from './NotificationBell'

describe('NotificationBell', () => {
  beforeEach(() => setupApi({ '/notifications': { notifications: [], unreadCount: 12, counts: {} } }))
  it('shows the current unread count and links to the action centre', async () => {
    const link = await (async () => { renderPage(<NotificationBell />); return screen.findByRole('link', { name: /12 unread notifications/i }) })()
    expect(await link).toHaveAttribute('href', '/dashboard/notifications'); expect(screen.getByText('12')).toBeInTheDocument()
  })
})
