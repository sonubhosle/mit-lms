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

import CustomDropdown from '@/components/ui/CustomDropdown'

const GENRES = [
  { label: "All Genres", value: "" },
  { label: "Fiction", value: "Fiction" },
  { label: "Non-Fiction", value: "Non-Fiction" },
  { label: "Science", value: "Science" },
  { label: "History", value: "History" },
  { label: "Technology", value: "Technology" },
  { label: "Mathematics", value: "Mathematics" },
  { label: "Literature", value: "Literature" },
  { label: "Philosophy", value: "Philosophy" },
  { label: "Biography", value: "Biography" }
]

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
      <div className="flex  flex-col md:flex-row md:items-center justify-between gap-4 bg-white  p-4 rounded-2xl shadow-soft">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-3 border border-slate-100 focus:border-amber-400 rounded-2xl outline-none focus:ring-3 focus:ring-amber-500/20 transition ease-in duration-300"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <CustomDropdown
            options={GENRES}
            value={genre}
            onChange={(val) => { setGenre(val); setPage(1); }}
            placeholder="Filter by Genre"
            className="w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100  bg-white ">
        <table className="animate-fade-in w-full text-left border-collapse [&_th]:border-b-2 [&_th]:border-slate-100  [&_th]:text-slate-600 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50  [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
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
                    <td className="font-mono text-sm text-slate-700">{book.isbn}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">{book.title}</span>
                        <span className="text-xs text-slate-500 font-medium">{book.author}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-700 tracking-wide">
                        {book.genre}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900">
                      ₹{book.price || 0}
                    </td>
                    <td className="text-center font-bold">
                      <span className="text-slate-900">{book.availableCopies}</span>
                      <span className="text-slate-500/40 text-xs mx-1">/</span>
                      <span className="text-slate-500 text-xs font-normal">{book.totalCopies}</span>
                    </td>
                    <td>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-900">
                        {book.availableCopies > 0 && (
                          <button
                            onClick={() => handleIssueDirect(book._id)}
                            className="px-4 py-2 cursor-pointer flex items-center gap-2 bg-linear-to-r from-green-500 to-green-700 text-white rounded-3xl  hover:from-green-700 hover:to-green-500 transition ease-in duration-300 hover:shadow-2xl font-semibold text-base "
                            title="Issue this book"
                          >

                            Issue
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(book)}
                          className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-violet-500 to-violet-700 text-white rounded-2xl px-4 py-2 hover:from-violet-700 hover:to-violet-500 transition ease-in duration-300 hover:shadow-2xl font-semibold text-base"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(book)}
                          className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-rose-500 to-rose-700 text-white rounded-2xl px-4 py-2 hover:from-rose-700 hover:to-rose-500 transition ease-in duration-300 hover:shadow-2xl font-semibold text-base"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-20 text-slate-500">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white shadow-xl shadow-slate-200/50 px-6 py-4 rounded-2xl shadow-soft">
          <p className="text-sm text-slate-500">
            Page <span className="font-bold">{page}</span> of <span className="font-bold">{data.pagination.pages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg  hover:bg-slate-50 border border-slate-100 disabled:opacity-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page === data.pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg  hover:bg-slate-50 border border-slate-100 disabled:opacity-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
