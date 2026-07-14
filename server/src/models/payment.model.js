import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
      required: true,
    },
    status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'], default: 'paid' },
    paidAt: { type: Date, default: Date.now },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true, default: '' },
    gateway: { type: String, enum: ['manual', 'razorpay'], default: 'manual' },
    gatewayOrderId: { type: String, trim: true },
    gatewayPaymentId: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true },
)

export const Payment = mongoose.model('Payment', paymentSchema)
