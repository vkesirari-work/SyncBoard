import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'

export const owner = { id: 'owner-1', name: 'Vikram Owner', email: 'owner@example.com', role: 'admin', permissions: [] }

export const analyticsFixture = {
  summary: { revenue: 0, paidTransactions: 0, checkIns: 0, averageVisitMinutes: 0, newMembers: 0, activeMembers: 0, leads: 0, convertedLeads: 0 },
  series: [], paymentMethods: [], planRevenue: [],
}

export function responseFor(url) {
  if (url === '/members/me') return { member: { _id: 'member-1', name: 'Test Member', status: 'active' }, trainer: null, payments: [], attendance: [] }
  if (url.startsWith('/member-progress/')) return { member: { _id: 'member-1', name: 'Test Member', status: 'active', plan: { name: 'Monthly' } }, progress: { measurements: [], photos: [], workoutPlan: { exercises: [] } }, canEdit: true }
  if (url === '/admin/analytics') return analyticsFixture
  if (url === '/members') return { members: [] }
  if (url === '/plans') return { plans: [] }
  if (url === '/payments') return { payments: [] }
  if (url === '/attendance') return { attendance: [] }
  if (url === '/leads') return { leads: [] }
  if (url === '/trainers') return { trainers: [] }
  if (url === '/trainers/me') return { trainer: { name: 'Test Trainer', shift: 'morning', specialties: [], assignedMembers: [] } }
  if (url === '/training-sessions') return { sessions: [] }
  if (url === '/trainer-leaves') return { leaves: [] }
  if (url.startsWith('/notifications')) return { notifications: [], unreadCount: 0, counts: { renewal: 0, payment: 0, lead: 0 } }
  if (url === '/staff') return { staff: [], availablePermissions: ['dashboard', 'members'] }
  if (url.startsWith('/staff/audit')) return { logs: [] }
  if (url === '/settings' || url === '/settings/public') return { settings: { gymName: 'Sirari Fitness' }, paymentsConfigured: false, paymentMode: 'test' }
  if (url === '/auth/me') return { user: owner }
  return {}
}

export function setupApi(overrides = {}) {
  api.get.mockImplementation(async (url) => ({ data: overrides[url] ?? responseFor(url) }))
  api.post.mockResolvedValue({ data: {} })
  api.patch.mockResolvedValue({ data: {} })
  api.put.mockResolvedValue({ data: {} })
  api.delete.mockResolvedValue({ data: {} })
}

export function setAuth(user = owner, token = 'test-token') {
  useAuthStore.setState({ user, token, isChecking: false })
}

export function renderPage(element, route = '/dashboard', routePath = '*') {
  return render(<MemoryRouter initialEntries={[route]}><Routes><Route path={routePath} element={element} /></Routes></MemoryRouter>)
}
