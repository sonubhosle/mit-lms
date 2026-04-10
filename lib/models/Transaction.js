import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: { 
    type: String, 
    enum: ["issued", "returned", "overdue", "lost"], 
    default: "issued" 
  },
  fineAmount: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  remarks: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
})

TransactionSchema.index({ status: 1, dueDate: 1 })

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)
