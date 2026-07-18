import { expect, test } from '@playwright/test'

const owner = { id: 'owner-1', name: 'Vikram Owner', email: 'owner@example.com', role: 'admin', permissions: [] }

async function mockApi(page, { leads = [], members = [], attendance = [], trainers = [], sessions = [] } = {}) {
  await page.route('http://localhost:5001/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api', '')
    const payloads = {
      '/auth/login': { token: 'e2e-token', user: owner },
      '/auth/me': { user: owner },
      '/settings/public': { settings: { gymName: 'Sirari Fitness' } },
      '/settings': { settings: { gymName: 'Sirari Fitness' }, paymentsConfigured: false },
      '/notifications': { notifications: [], unreadCount: 0, counts: {} },
      '/admin/dashboard': { stats: { activeMembers: 12, todayCheckIns: 4, monthlyRevenue: 9999, renewalsDue: 2 }, payments: [], leads: [] },
      '/leads': { leads },
      '/members': { members, pagination: { page: 1, limit: 20, total: members.length, pages: 1 } },
      '/attendance': { attendance, pagination: { page: 1, limit: 20, total: attendance.length, pages: 1 }, summary: { total: attendance.length, today: attendance.length, inside: attendance.filter((item) => !item.checkOut).length, insideMemberIds: attendance.filter((item) => !item.checkOut).map((item) => item.member?._id) } },
      '/trainers': { trainers },
      '/training-sessions': { sessions },
    }
    const body = request.method() === 'PATCH' && path.startsWith('/leads/')
      ? { lead: { ...leads[0], ...request.postDataJSON() } }
      : payloads[path] || {}
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}

async function seedOwner(page) {
  await page.addInitScript((user) => {
    localStorage.setItem('authToken', 'e2e-token')
    localStorage.setItem('authUser', JSON.stringify(user))
  }, owner)
}

test('public website renders its primary journey', async ({ page, isMobile }) => {
  await mockApi(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /your strongest era/i })).toBeVisible()
  if (isMobile) await page.getByRole('button', { name: 'Toggle navigation' }).click()
  const dashboardLogin = page.getByRole('link', { name: /dashboard login/i })
  await expect(dashboardLogin).toBeVisible()
  if (isMobile) expect((await dashboardLogin.boundingBox()).height).toBeGreaterThanOrEqual(50)
  await expect(page.getByText('9012752982', { exact: true })).toBeVisible()
})

test('owner can sign in and see live dashboard totals', async ({ page }) => {
  await mockApi(page)
  await page.goto('/login')
  await page.getByLabel('Email').fill('owner@example.com')
  await page.getByLabel('Password').fill('secure-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: /your gym/i })).toBeVisible()
  await expect(page.getByText('12').first()).toBeVisible()
})

test('mobile owner can move a lead without drag and drop', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch status control is shown at the mobile breakpoint')
  const lead = { _id: 'lead-1', name: 'Riya Sharma', phone: '9999999999', status: 'new', source: 'website', createdAt: '2026-07-18T08:00:00.000Z' }
  await seedOwner(page)
  await mockApi(page, { leads: [lead] })
  await page.goto('/dashboard/leads')
  const status = page.getByRole('combobox', { name: 'Move Riya Sharma to status' })
  await expect(status).toBeVisible()
  const patch = page.waitForRequest((request) => request.method() === 'PATCH' && request.url().endsWith('/api/leads/lead-1'))
  await status.selectOption('contacted')
  expect((await patch).postDataJSON()).toEqual({ status: 'contacted' })
})

test('mobile operations tables render as cards without horizontal overflow', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Responsive card layout is verified at the mobile breakpoint')
  const member = { _id: 'member-1', name: 'Asha Singh', phone: '9000000000', status: 'active' }
  const trainer = { _id: 'trainer-1', name: 'Coach Aman', phone: '9888888888', email: 'coach@example.com', specialties: ['Strength'], shift: 'morning', workingDays: ['monday', 'tuesday'], assignedMembers: [member], isActive: true }
  const visit = { _id: 'visit-1', member, checkIn: new Date().toISOString(), checkOut: null, notes: 'Morning workout' }
  const session = { _id: 'session-1', member, trainer, scheduledAt: new Date(Date.now() + 3_600_000).toISOString(), focus: 'Strength', durationMinutes: 60, status: 'scheduled' }
  await seedOwner(page)
  await mockApi(page, { members: [member], attendance: [visit], trainers: [trainer], sessions: [session] })

  for (const [path, heading] of [['/dashboard/attendance', 'Attendance'], ['/dashboard/trainers', 'Trainers'], ['/dashboard/sessions', 'Training sessions']]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    await expect(page.locator('.member-table tbody tr')).toHaveCount(1)
    const layout = await page.evaluate(() => {
      const table = document.querySelector('.member-table')
      const row = table?.querySelector('tbody tr')
      return {
        viewport: window.innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        tableDisplay: table && getComputedStyle(table).display,
        rowDisplay: row && getComputedStyle(row).display,
        rowWidth: row?.getBoundingClientRect().width || 0,
      }
    })
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport)
    expect(layout.tableDisplay).toBe('block')
    expect(layout.rowDisplay).toBe('grid')
    expect(layout.rowWidth).toBeLessThanOrEqual(layout.viewport - 24)
  }
})
