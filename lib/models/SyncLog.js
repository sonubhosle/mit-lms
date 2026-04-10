import mongoose from 'mongoose'

const SyncLogSchema = new mongoose.Schema({
  syncedAt: { type: Date, default: Date.now },
  documentsSync: Number,
  status: { type: String, enum: ["success", "failed"] },
  error: String
})

export default mongoose.models.SyncLog || mongoose.model('SyncLog', SyncLogSchema)
