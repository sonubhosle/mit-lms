import mongoose from 'mongoose'

const FineSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  amount: { type: Number, required: true },
  reason: String,
  isPaid: { type: Boolean, default: false },
  paidDate: Date,
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Fine || mongoose.model('Fine', FineSchema)
