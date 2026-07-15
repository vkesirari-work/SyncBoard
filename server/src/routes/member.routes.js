import { Router } from 'express'
import {
  createMember,
  deleteMember,
  getMember,
  getMyMemberPortal,
  listMembers,
  saveMemberAccount,
  updateMember,
} from '../controllers/member.controller.js'
import { requireAnyPermission, requireAuth, requirePermission, requireRole } from '../middleware/auth.middleware.js'

export const memberRouter = Router()

memberRouter.use(requireAuth)
memberRouter.get('/', requireAnyPermission(['members', 'payments', 'attendance', 'sessions'], 'trainer'), listMembers)
memberRouter.get('/me', requireRole('member'), getMyMemberPortal)
memberRouter.get('/:id', requireAnyPermission(['members', 'payments', 'attendance', 'sessions'], 'trainer'), getMember)
memberRouter.post('/', requirePermission('members'), createMember)
memberRouter.put('/:id/account', requireRole('admin', 'user'), saveMemberAccount)
memberRouter.patch('/:id', requirePermission('members', 'trainer'), updateMember)
memberRouter.delete('/:id', requirePermission('members'), deleteMember)
