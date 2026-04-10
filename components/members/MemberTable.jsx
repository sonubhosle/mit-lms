"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import clsx from 'clsx'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function MemberTable({ onEdit, onDelete, onView }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useSWR(
    `/api/members?page=${page}&search=${debouncedSearch}`,
    fetcher
  )

  const getMemberTypeColor = (type) => {
    switch (type) {
      case 'BCA': return 'bg-blue-100 text-blue-700'
      case 'B.Sc CS': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-slate'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, member ID, or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="table-container bg-white shadow-soft">
        <table className="animate-fade-in">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name & Contact</th>
              <th>Class</th>
              <th>Fines Due</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-20"><LoadingSpinner /></td>
              </tr>
            ) : data?.members?.length > 0 ? (
              data.members.map((member) => {
                return (
                  <tr key={member._id}>
                    <td className="font-mono text-sm font-bold text-navy">{member.memberId}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-navy">{member.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate font-medium">
                          <span className="flex items-center gap-1"><Phone size={10} /> {member.phone}</span>
                          <span className="opacity-30">|</span>
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={clsx("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", getMemberTypeColor(member.className))}>
                        {member.className}
                      </span>
                    </td>
                    <td>
                      {member.finesDue > 0 ? (
                        <span className="text-danger font-black text-sm">₹{member.finesDue}</span>
                      ) : (
                        <span className="text-success font-bold text-sm">₹0</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={member.isActive ? 'success' : 'danger'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onView(member)}
                          className="p-2 text-slate hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(member)}
                          className="p-2 text-slate hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(member)}
                          className="p-2 text-slate hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                          title="Delete"
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
                <td colSpan="6" className="text-center py-20 text-slate font-medium">
                  No members found.
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
