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
    <div className="space-y-8">
      <div className="animate-fade-in space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Books Management</h1>
            <p className="text-slate-500 font-medium">Manage your library's inventory, stock, and categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button className=" cursor-pointer flex items-center gap-2 bg-linear-to-r from-violet-500 to-violet-700 text-white rounded-2xl px-5 py-3 hover:from-violet-700 hover:to-violet-500 transition ease-in duration-300 hover:shadow-2xl">
              <FileUp size={20} />
              <span>Import CSV</span>
            </button>
            <button className=" cursor-pointer flex items-center gap-2 bg-linear-to-r from-green-500 to-green-700 text-white rounded-2xl px-5 py-3 hover:from-green-700 hover:to-green-500 transition ease-in duration-300 hover:shadow-2xl">
              <FileDown size={20} />
              <span>Export Excel</span>
            </button>
            <button onClick={handleAdd} className=" cursor-pointer flex items-center gap-2 bg-linear-to-r from-amber-400 to-amber-500 text-white rounded-2xl px-5 py-3 hover:from-amber-500 hover:to-amber-400 transition ease-in duration-300 hover:shadow-2xl">
              <Plus size={20} />
              <span>Add New Book</span>
            </button>
          </div>
        </div>

        <BookTable onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={selectedBook}
        onSave={handleSave}
      />
    </div>
  )
}
