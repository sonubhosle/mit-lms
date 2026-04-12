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
import MemberDetailModal from '@/components/members/MemberDetailModal'
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function MemberTable({ onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [viewMember, setViewMember] = useState(null)
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
      default: return 'bg-slate-100 text-slate-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-xl shadow-slate-200/50 p-4 rounded-2xl shadow-soft">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, member ID, or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 shadow-sm">
        <table className="animate-fade-in w-full text-left border-collapse [&_th]:bg-slate-50 border border-slate-100 [&_th]:text-slate-500 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 border border-slate-100 [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name & Contact</th>
              <th>Class</th>
              <th className="text-center">Books Issued</th>
              <th>Fine Status</th>
              <th>Account</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="py-20"><LoadingSpinner /></td>
              </tr>
            ) : data?.members?.length > 0 ? (
              data.members.map((member) => {
                return (
                  <tr key={member._id}>
                    <td className="font-mono text-sm font-bold text-slate-900">{member.memberId}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{member.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
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
                    <td className="text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-500/5 border border-slate-500/10 font-black text-sm bg-slate-900">
                        {member.activeIssues || 0}
                      </div>
                    </td>
                    <td>
                      {member.finesDue > 0 ? (
                        <div className="flex flex-col gap-1">
                           <span className="text-red-500 font-black text-sm">₹{member.finesDue}</span>
                           <span className="text-[9px] font-bold text-red-500 text-red-500/5 px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit">Unpaid</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                           <span className="text-emerald-500 font-bold text-sm">₹0</span>
                           <span className="text-[9px] font-bold text-emerald-500 text-emerald-500/5 px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit">All Paid</span>
                        </div>
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
                          onClick={() => setViewMember(member)}
                          className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(member)}
                          className="p-2 text-slate-500 hover:-amber-500 hover:-amber-500/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(member)}
                          className="p-2 text-slate-500 hover:-red-500 hover:-red-500/10 rounded-lg transition-all"
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
                <td colSpan="8" className="text-center py-20 text-slate-500 font-medium">
                  No members found.
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
              className="p-2 rounded-lg border border-slate-100 hover:bg-slate-50 border border-slate-100 disabled:opacity-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page === data.pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-slate-100 hover:bg-slate-50 border border-slate-100 disabled:opacity-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      <MemberDetailModal
        isOpen={!!viewMember}
        onClose={() => setViewMember(null)}
        member={viewMember}
      />
    </div>
  )
}
