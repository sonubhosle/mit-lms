"use client"

import { AlertCircle, IndianRupee, Phone, Calendar, RefreshCw } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { format, differenceInDays } from 'date-fns'
import { decrypt } from '@/lib/encryption'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function OverduePage() {
  const { data, isLoading } = useSWR('/api/transactions/overdue', fetcher)

  const handleReturn = async (id) => {
    if (!confirm('Confirm return and stock update?')) return
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return' })
      })
      if (res.ok) mutate('/api/transactions/overdue')
    } catch (err) {
      alert('Failed to return book')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Overdue Collections</h1>
          <p className="text-slate-500 font-medium">Identify and manage books past their return deadlines</p>
        </div>
        <div className="text-red-500/10 px-6 py-3 rounded-2xl flex items-center gap-3 border text-red-500/20">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Total Overdue</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{data?.length || 0} Items</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 shadow-sm">
        <table className="w-full text-left border-collapse [&_th]:bg-slate-50 border border-slate-100 [&_th]:text-slate-500 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 border border-slate-100 [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Member details</th>
              <th>Book title</th>
              <th>Due Date</th>
              <th>Overdue Days</th>
              <th>Fine Amount</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-20"><LoadingSpinner /></td>
              </tr>
            ) : data?.length > 0 ? (
              data.map((tx) => {
                const overdueDays = differenceInDays(new Date(), new Date(tx.dueDate))
                return (
                  <tr key={tx._id}>
                    <td>
                      <div className="font-bold text-slate-900">{tx.memberId?.name}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Phone size={12} />
                        <span>Contact Pending</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 line-clamp-1">{tx.bookId?.title}</div>
                      <div className="text-xs text-slate-500">{tx.bookId?.isbn}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Calendar size={14} className="text-slate-500" />
                        {format(new Date(tx.dueDate), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td>
                      <Badge variant="danger" className="text-sm font-bold">
                        {overdueDays} Days
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 font-bold text-red-500">
                        <IndianRupee size={14} />
                        <span>{overdueDays * 5}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleReturn(tx._id)}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:-slate-950 transition-all flex items-center gap-2 ml-auto"
                      >
                        <RefreshCw size={14} />
                        <span>Quick Return</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-20 text-slate-500">
                  Great news! No overdue books found at the moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
