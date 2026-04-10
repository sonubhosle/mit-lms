import mongoose from 'mongoose'

const BookSchema = new mongoose.Schema({
  isbn: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  price: { type: Number, default: 0 },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  isActive: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

BookSchema.index({ title: 'text', author: 'text' })

export default mongoose.models.Book || mongoose.model('Book', BookSchema)
