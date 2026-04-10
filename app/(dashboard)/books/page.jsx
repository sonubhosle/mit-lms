"use client"

import { useState } from 'react'
import BookTable from '@/components/books/BookTable'
import BookModal from '@/components/books/BookModal'
import { Plus, FileUp, FileDown } from 'lucide-react'
import { mutate } from 'swr'
import { toast } from 'react-hot-toast'

export default function BooksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)

  const handleAdd = () => {
    setSelectedBook(null)
    setIsModalOpen(true)
  }

  const handleEdit = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleDelete = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      const loadingToast = toast.loading(`Deleting "${book.title}"...`)
      try {
        const res = await fetch(`/api/books/${book._id}`, { method: 'DELETE' })
        if (res.ok) {
          mutate((key) => typeof key === 'string' && key.startsWith('/api/books'))
          toast.success("Book deleted successfully!", { id: loadingToast })
        } else {
          toast.error("Failed to delete book.", { id: loadingToast })
        }
      } catch (err) {
        toast.error("A network error occurred.", { id: loadingToast })
      }
    }
  }

  const handleSave = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/books'))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy">Books Management</h1>
          <p className="text-slate font-medium">Manage your library's inventory, stock, and categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary px-5 py-3">
            <FileUp size={20} />
            <span>Import CSV</span>
          </button>
          <button className="btn-secondary px-5 py-3">
            <FileDown size={20} />
            <span>Export Excel</span>
          </button>
          <button onClick={handleAdd} className="btn-primary px-6 py-3 shadow-lg shadow-gold/20">
            <Plus size={20} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      <BookTable onEdit={handleEdit} onDelete={handleDelete} />

      <BookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        book={selectedBook}
        onSave={handleSave}
      />
    </div>
  )
}
