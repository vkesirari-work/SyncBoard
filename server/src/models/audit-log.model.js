import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorName: { type: String, trim: true },
    actorEmail: { type: String, trim: true },
    role: { type: String, trim: true },
    method: { type: String, required: true },
    path: { type: String, required: true, index: true },
    statusCode: { type: Number, required: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true },
)

auditLogSchema.index({ createdAt: -1 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
