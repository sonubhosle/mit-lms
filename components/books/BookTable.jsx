"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Filter,
  Book,
  HandHelping
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import clsx from 'clsx'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function BookTable({ onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const router = useRouter()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useSWR(
    `/api/books?page=${page}&search=${debouncedSearch}&genre=${genre}`,
    fetcher
  )

  const getStatus = (book) => {
    if (book.availableCopies === 0) return { label: 'All Issued', variant: 'danger' }
    if (book.availableCopies < 2) return { label: 'Low Stock', variant: 'warning' }
    return { label: 'Available', variant: 'success' }
  }

  const handleIssueDirect = (bookId) => {
    router.push(`/transactions?action=issue&bookId=${bookId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={18} />
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={16} />
            <select 
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl appearance-none focus:ring-2 focus:ring-gold/20 outline-none cursor-pointer"
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setPage(1); }}
            >
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container bg-white shadow-soft">
        <table className="animate-fade-in">
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Book Title & Author</th>
              <th>Genre</th>
              <th>Price</th>
              <th className="text-center">Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-20"><LoadingSpinner /></td>
              </tr>
            ) : data?.books?.length > 0 ? (
              data.books.map((book) => {
                const status = getStatus(book)
                return (
                  <tr key={book._id}>
                    <td className="font-mono text-sm text-slate-dark">{book.isbn}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-navy text-base">{book.title}</span>
                        <span className="text-xs text-slate font-medium">{book.author}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-slate-dark tracking-wide">
                        {book.genre}
                      </span>
                    </td>
                    <td className="font-bold text-navy">
                      ₹{book.price || 0}
                    </td>
                    <td className="text-center font-bold">
                      <span className="text-navy">{book.availableCopies}</span>
                      <span className="text-slate/40 text-xs mx-1">/</span>
                      <span className="text-slate text-xs font-normal">{book.totalCopies}</span>
                    </td>
                    <td>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 text-navy">
                        {book.availableCopies > 0 && (
                          <button 
                            onClick={() => handleIssueDirect(book._id)}
                            className="p-2 text-success hover:bg-success/10 rounded-lg transition-all flex items-center gap-1 font-bold text-xs"
                            title="Issue this book"
                          >
                            <HandHelping size={18} />
                            <span className="hidden lg:inline">Issue</span>
                          </button>
                        )}
                        <button 
                          onClick={() => onEdit(book)}
                          className="p-2 text-slate hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(book)}
                          className="p-2 text-slate hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-20 text-slate">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-soft">
          <p className="text-sm text-slate">
            Page <span className="font-bold">{page}</span> of <span className="font-bold">{data.pagination.pages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page === data.pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
