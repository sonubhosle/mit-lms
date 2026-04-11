"use client"

import { useState, useEffect } from 'react'
import { X, Save, Book as BookIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import CustomDropdown from '@/components/ui/CustomDropdown'

const GENRES = [
  "Fiction", "Non-Fiction", "Science", "History", "Technology",
  "Mathematics", "Literature", "Philosophy", "Biography"
]

export default function BookModal({ isOpen, onClose, book, onSave }) {
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    genre: '',
    totalCopies: 1,
    price: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (book) {
      setFormData({
        isbn: book.isbn || '',
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || '',
        totalCopies: book.totalCopies || 1,
        price: book.price || 0
      })
    } else {
      setFormData({
        isbn: '',
        title: '',
        author: '',
        genre: '',
        totalCopies: 1,
        price: 0
      })
    }
    setError('')
  }, [book, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const loadingToast = toast.loading(book ? 'Updating book...' : 'Adding book...')

    try {
      const url = book ? `/api/books/${book._id}` : '/api/books'
      const method = book ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save book')

      toast.success(book ? 'Book updated!' : 'Book added successfully!', { id: loadingToast })
      onSave()
      onClose()
    } catch (err) {
      setError(err.message)
      toast.error(err.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-4xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-navy">
        <div className="bg-navy p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-navy font-bold">
              <BookIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{book ? 'Edit Book' : 'Add New Book'}</h3>
              <p className="text-xs text-slate-light opacity-80">Manage library inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">ISBN *</label>
              <input 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all font-medium"
                placeholder="ISBN Number"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>
            <CustomDropdown
              label="Genre *"
              options={GENRES}
              value={formData.genre}
              onChange={(val) => setFormData({ ...formData, genre: val })}
              placeholder="Select Genre"
              searchable
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Book Title *</label>
            <input 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all font-bold text-lg"
              placeholder="Full Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Author Name *</label>
            <input 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all font-medium"
              placeholder="Author's Full Name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Total Copies *</label>
              <input 
                type="number"
                min="1"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all font-bold"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Price (₹)</label>
              <input 
                type="number"
                min="0"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all font-bold text-navy"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger/10 p-4 rounded-xl text-danger text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-slate font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold text-navy py-4 rounded-2xl font-bold shadow-lg shadow-gold/20 hover:bg-gold-hover transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <Save size={20} />
                  <span>{book ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
