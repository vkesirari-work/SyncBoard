import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['renewal', 'payment', 'lead', 'system'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    priorityRank: { type: Number, enum: [1, 2, 3], default: 2 },
    dueAt: { type: Date, required: true, index: true },
    link: { type: String, trim: true, default: '/dashboard' },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    dismissedAt: Date,
    resolvedAt: Date,
    generated: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Notification = mongoose.model('Notification', notificationSchema)
