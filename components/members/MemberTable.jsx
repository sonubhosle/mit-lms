"use client"

import { useState, useEffect } from 'react'
import {
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone,
  Mail
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white  p-4 rounded-2xl shadow-soft">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, member ID, or mobile..."
            className="w-full pl-10 pr-4 py-3 border border-slate-100 focus:border-amber-400 rounded-2xl outline-none focus:ring-3 focus:ring-amber-500/20 transition ease-in duration-300"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white  ">
        <table className="animate-fade-in w-full text-left border-collapse [&_th]:border-b-2 [&_th]:border-slate-100   [&_th]:text-slate-500 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Class</th>
              <th className="text-center">Books Issued</th>
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
                    <td>
                      <div className="flex ">
                        <span className="font-semibold text-slate-800 max-w-[200px] wrap-break-word">
                          {member.name}
                        </span>                 </div>
                    </td>
                    <td>
                      <div className="text-[13px] text-slate-600 font-medium">
                        <span className="flex items-center gap-1"><Phone size={10} /> {member.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={10} />{member.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={clsx("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", getMemberTypeColor(member.className))}>
                        {member.className}
                      </span>
                    </td>
                    <td >
                      <div className="inline-flex items-center px-3 py-1 rounded-2xl text-slate-800  border border-slate-100  text-sm ">
                        Issued {member.activeIssues || 0}
                      </div>
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
                          className="px-4 py-2 cursor-pointer flex items-center gap-2 bg-linear-to-r from-green-500 to-green-700 text-white rounded-3xl  hover:from-green-700 hover:to-green-500 transition ease-in duration-300 hover:shadow-2xl font-semibold text-base "
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onEdit(member)}
                          className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-violet-500 to-violet-700 text-white rounded-2xl px-4 py-2 hover:from-violet-700 hover:to-violet-500 transition ease-in duration-300 hover:shadow-2xl font-semibold text-base"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(member)}
                          className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-rose-500 to-rose-700 text-white rounded-2xl px-4 py-2 hover:from-rose-700 hover:to-rose-500 transition ease-in duration-300 hover:shadow-2xl font-semibold text-base"
                          title="Delete"
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

      <MemberDetailModal
        isOpen={!!viewMember}
        onClose={() => setViewMember(null)}
        member={viewMember}
      />
    </div>
  )
}
