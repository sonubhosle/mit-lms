import mongoose from 'mongoose'

const MemberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  className: { 
    type: String, 
    enum: ["BCA", "B.Sc CS"], 
    required: true 
  },
  address: String,
  isActive: { type: Boolean, default: true },
  finesDue: { type: Number, default: 0 },
  membershipExpiry: { type: Date, default: () => new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000) }, // 10 years default
  createdAt: { type: Date, default: Date.now }
})

if (mongoose.models.Member) {
  delete mongoose.models.Member
}

export default mongoose.model('Member', MemberSchema)
