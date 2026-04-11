"use client"

import { useState } from 'react'
import { Search, Download, Calendar as CalendarIcon, RotateCcw, AlertOctagon, FileText } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import useSWR, { mutate } from 'swr'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { generateInvoice } from '@/lib/utils/generateInvoice'

const fetcher = (url) => fetch(url).then((res) => res.json())

import CustomDropdown from '@/components/ui/CustomDropdown'

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Issued", value: "issued" },
  { label: "Returned", value: "returned" },
  { label: "Overdue", value: "overdue" },
  { label: "Lost", value: "lost" }
]

export default function TransactionTable() {
  const [filterStatus, setFilterStatus] = useState('')
  const { data, isLoading } = useSWR(`/api/transactions${filterStatus ? `?status=${filterStatus}` : ''}`, fetcher)
  const [actionLoading, setActionLoading] = useState(null)

  const getStatusVariant = (status) => {
    switch (status) {
      case 'issued': return 'info'
      case 'returned': return 'success'
      case 'overdue': return 'danger'
      case 'lost': return 'danger'
      default: return 'info'
    }
  }

  const handleAction = async (id, action) => {
    const confirmMessage = action === 'lost' 
      ? "Mark this book as LOST? This will charge the FULL book price + penalties to the member."
      : "Process return for this book?"
    
    if (!window.confirm(confirmMessage)) return

    setActionLoading(id)
    const t = toast.loading(action === 'lost' ? "Reporting lost book..." : "Processing return...")
    
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      toast.success(data.message, { id: t })
      mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'))
    } catch (err) {
      toast.error(err.message, { id: t })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <h3 className="text-xl font-bold text-navy px-2">Transaction History</h3>
        <div className="flex items-center gap-3">
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            placeholder="Status"
            className="w-40"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy-dark transition-all">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="table-container bg-white shadow-soft">
        <table className="animate-fade-in">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Book Title</th>
              <th>Issued On</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="py-20"><LoadingSpinner /></td>
              </tr>
            ) : data?.length > 0 ? (
              data.map((tx) => (
                <tr key={tx._id}>
                  <td className="font-mono text-xs font-bold text-slate">{tx.transactionId}</td>
                  <td>
                    <div className="font-bold text-navy">{tx.memberId?.name}</div>
                    <div className="text-xs text-slate">{tx.memberId?.memberId}</div>
                  </td>
                  <td>
                    <div className="font-bold text-navy line-clamp-1">{tx.bookId?.title}</div>
                    <div className="text-[10px] text-slate font-medium">{tx.remarks}</div>
                  </td>
                  <td className="text-slate text-sm">
                    {format(new Date(tx.issueDate), 'dd MMM yyyy')}
                  </td>
                  <td className="text-slate text-sm">
                    {format(new Date(tx.dueDate), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                      {tx.status}
                    </Badge>
                  </td>
                  <td>
                    {tx.fineAmount > 0 ? (
                      <span className="text-danger font-bold">₹{tx.fineAmount}</span>
                    ) : (
                      <span className="text-slate">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => generateInvoice(tx)}
                        className="p-1.5 text-navy hover:bg-navy/10 rounded-lg transition-all"
                        title="Download Invoice"
                      >
                        <FileText size={16} />
                      </button>

                      {tx.status === 'issued' || tx.status === 'overdue' ? (
                        <>
                          <button 
                            disabled={actionLoading === tx._id}
                            onClick={() => handleAction(tx._id, 'return')}
                            className="px-3 py-1.5 bg-success/10 text-success text-xs font-bold rounded-lg hover:bg-success hover:text-white transition-all flex items-center gap-1"
                          >
                            <RotateCcw size={14} />
                            <span>Return</span>
                          </button>
                          <button 
                            disabled={actionLoading === tx._id}
                            onClick={() => handleAction(tx._id, 'lost')}
                            className="px-3 py-1.5 bg-danger/10 text-danger text-xs font-bold rounded-lg hover:bg-danger hover:text-white transition-all flex items-center gap-1"
                          >
                            <AlertOctagon size={14} />
                            <span>Lost</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-light text-[10px] font-bold uppercase italic">Closed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
