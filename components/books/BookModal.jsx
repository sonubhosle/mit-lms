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
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isRendered) return null;

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
    <div className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-4xl w-full max-w-lg overflow-hidden  text-slate-900`}>
        <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center  font-bold">
              <BookIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{book ? 'Edit Book' : 'Add New Book'}</h3>
              <p className="text-xs text-slate-500 opacity-80">Manage library inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white shadow-xl shadow-slate-200/50/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ISBN *</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none transition-all font-medium"
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Book Title *</label>
            <input 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none transition-all font-bold text-lg"
              placeholder="Full Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Author Name *</label>
            <input 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none transition-all font-medium"
              placeholder="Author's Full Name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Copies *</label>
              <input 
                type="number"
                min="1"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none transition-all font-bold"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Price (₹)</label>
              <input 
                type="number"
                min="0"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none transition-all font-bold text-slate-900"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500/10 p-4 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50 border-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 relative overflow-hidden bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95 transition-all duration-300 rounded-2xl py-4 disabled:opacity-50 flex items-center justify-center gap-2"
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
