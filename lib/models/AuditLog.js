import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now, expires: '1y' } // TTL index
})

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
