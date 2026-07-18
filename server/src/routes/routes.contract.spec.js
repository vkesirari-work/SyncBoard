import { describe, expect, it } from 'vitest'
import { adminRouter } from './admin.routes.js'
import { attendanceRouter } from './attendance.routes.js'
import { authRouter } from './auth.routes.js'
import { leadRouter } from './lead.routes.js'
import { memberProgressRouter } from './member-progress.routes.js'
import { memberRouter } from './member.routes.js'
import { notificationRouter } from './notification.routes.js'
import { paymentRouter } from './payment.routes.js'
import { planRouter } from './plan.routes.js'
import { settingsRouter } from './settings.routes.js'
import { staffRouter } from './staff.routes.js'
import { trainerLeaveRouter } from './trainer-leave.routes.js'
import { trainerRouter } from './trainer.routes.js'
import { trainingSessionRouter } from './training-session.routes.js'

function contracts(router) {
  return router.stack.filter((layer) => layer.route).flatMap((layer) => Object.keys(layer.route.methods).filter((method) => layer.route.methods[method]).map((method) => `${method.toUpperCase()} ${layer.route.path}`))
}

describe('API route contracts', () => {
  it.each([
    [authRouter, ['POST /register', 'POST /login', 'GET /me', 'PATCH /change-password']],
    [adminRouter, ['GET /analytics', 'GET /search', 'POST /reset-data']],
    [memberRouter, ['GET /', 'GET /me', 'POST /', 'PUT /:id/account', 'PATCH /:id', 'DELETE /:id']],
    [memberProgressRouter, ['GET /:memberId', 'POST /:memberId/measurements', 'PUT /:memberId/workout-plan', 'POST /:memberId/photos']],
    [planRouter, ['GET /', 'POST /', 'PATCH /:id', 'DELETE /:id']],
    [paymentRouter, ['GET /', 'POST /checkout/order', 'POST /checkout/verify', 'POST /', 'PATCH /:id', 'DELETE /:id']],
    [attendanceRouter, ['GET /', 'POST /check-in', 'PATCH /:id/check-out', 'DELETE /:id']],
    [leadRouter, ['POST /', 'POST /admin', 'GET /', 'PATCH /:id', 'DELETE /:id']],
    [trainerRouter, ['GET /me', 'GET /', 'POST /', 'PUT /:id/account', 'PATCH /:id', 'DELETE /:id']],
    [trainingSessionRouter, ['GET /', 'POST /', 'PATCH /:id', 'DELETE /:id']],
    [trainerLeaveRouter, ['GET /', 'POST /', 'PATCH /:id', 'DELETE /:id']],
    [notificationRouter, ['GET /', 'PATCH /read-all', 'PATCH /:id/read', 'DELETE /:id']],
    [settingsRouter, ['GET /public', 'GET /', 'PATCH /']],
    [staffRouter, ['GET /', 'POST /', 'PATCH /:id', 'PUT /:id/password', 'GET /audit/logs']],
  ])('exposes the expected endpoints', (router, expected) => {
    expect(contracts(router)).toEqual(expect.arrayContaining(expected))
  })
})
