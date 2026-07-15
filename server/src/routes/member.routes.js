import { Router } from 'express'
import {
  createMember,
  deleteMember,
  getMember,
  listMembers,
  updateMember,
} from '../controllers/member.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const memberRouter = Router()

memberRouter.use(requireAuth)
memberRouter.get('/', listMembers)
memberRouter.get('/:id', getMember)
memberRouter.post('/', requireRole('admin', 'user'), createMember)
memberRouter.patch('/:id', updateMember)
memberRouter.delete('/:id', requireRole('admin', 'user'), deleteMember)
