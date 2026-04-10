import mongoose from 'mongoose'

const ReservationSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  reservedDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["pending", "fulfilled", "cancelled"], 
    default: "pending" 
  }
})

export default mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema)
