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
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const memberRouter = Router()

memberRouter.use(requireAuth)
memberRouter.get('/', requireRole('admin', 'user', 'trainer'), listMembers)
memberRouter.get('/me', requireRole('member'), getMyMemberPortal)
memberRouter.get('/:id', requireRole('admin', 'user', 'trainer'), getMember)
memberRouter.post('/', requireRole('admin', 'user'), createMember)
memberRouter.put('/:id/account', requireRole('admin', 'user'), saveMemberAccount)
memberRouter.patch('/:id', requireRole('admin', 'user', 'trainer'), updateMember)
memberRouter.delete('/:id', requireRole('admin', 'user'), deleteMember)
