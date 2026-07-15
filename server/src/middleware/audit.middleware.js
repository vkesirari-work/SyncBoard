import { AuditLog } from '../models/audit-log.model.js'

export function auditMutations(request, response, next) {
  response.on('finish', () => {
    if (!request.user || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) || response.statusCode >= 400) return
    AuditLog.create({
      actor: request.user._id,
      actorName: request.user.name,
      actorEmail: request.user.email,
      role: request.user.role,
      method: request.method,
      path: request.originalUrl.split('?')[0],
      statusCode: response.statusCode,
      ip: request.ip,
      userAgent: request.get('user-agent') || '',
    }).catch((error) => console.warn(`Audit log unavailable: ${error.message}`))
  })
  next()
}
