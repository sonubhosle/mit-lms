"use client"

import { useState } from 'react'
import { Download, RotateCcw, AlertOctagon, FileText } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import useSWR, { mutate } from 'swr'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import CustomDropdown from '@/components/ui/CustomDropdown'
import PaymentModal from './PaymentModal'
import LateReturnModal from './LateReturnModal'

const fetcher = (url) => fetch(url).then((res) => res.json())

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
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [lateReturnTxn, setLateReturnTxn] = useState(null)

  const handlePrintClick = (tx) => {
    setSelectedTxn(tx)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (updatedTx) => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'))
    setSelectedTxn(updatedTx)
  }

  const getStatusVariant = (status) => {
    // ... logic ...
    switch (status) {
      case 'issued': return 'info'
      case 'returned': return 'success'
      case 'overdue': return 'danger'
      case 'lost': return 'danger'
      default: return 'info'
    }
  }

  const handleAction = async (id, action) => {
    if (action !== 'lost') return // Return is now handled via LateReturnModal
    const confirmMessage = "Mark this book as LOST? This will charge the FULL book price + penalties to the member."
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
      {/* ... Filter Header ... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-xl shadow-slate-200/50 p-4 rounded-2xl shadow-soft">
        <h3 className="text-xl font-bold text-slate-900 px-2">Transaction History</h3>
        <div className="flex items-center gap-3">
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            placeholder="Status"
            className="w-40"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:-slate-950 transition-all">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 shadow-sm">
        <table className="animate-fade-in w-full text-left border-collapse [&_th]:bg-slate-50 border border-slate-100 [&_th]:text-slate-500 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 border border-slate-100 [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
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
                  <td className="font-mono text-xs font-bold text-slate-500">{tx.transactionId}</td>
                  <td>
                    <div className="font-bold text-slate-900">{tx.memberId?.name}</div>
                    <div className="text-xs text-slate-500">{tx.memberId?.memberId}</div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-900 line-clamp-1">{tx.bookId?.title}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{tx.remarks}</div>
                  </td>
                  <td className="text-slate-500 text-sm">
                    {format(new Date(tx.issueDate), 'dd MMM yyyy')}
                  </td>
                  <td className="text-slate-500 text-sm">
                    {format(new Date(tx.dueDate), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                      {tx.status}
                    </Badge>
                  </td>
                  <td>
                    {tx.fineAmount > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-red-500 font-bold">₹{tx.fineAmount}</span>
                        {tx.finePaid ? (
                          <span className="text-[10px] text-emerald-500 font-black uppercase">Paid</span>
                        ) : (
                          <span className="text-[10px] text-red-500 font-black uppercase">Pending</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">

                      {/* Premium Invoice Button */}
                      <button
                        onClick={() => handlePrintClick(tx)}
                        title="Invoice & Payment"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-900 text-amber-500 text-xs font-bold rounded-lg border text-slate-900 hover:-amber-500 hover:-slate-900 transition-all group"
                      >
                        <FileText size={13} className="group-hover:scale-110 transition-transform" />
                        <span>Invoice</span>
                      </button>

                      {tx.status === 'issued' || tx.status === 'overdue' ? (
                        <>
                          <button
                            disabled={actionLoading === tx._id}
                            onClick={() => setLateReturnTxn(tx)}
                            className="px-3 py-1.5 text-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg hover:-emerald-500 hover:text-slate-900 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <RotateCcw size={13} />
                            <span>Return</span>
                          </button>
                          <button
                            disabled={actionLoading === tx._id}
                            onClick={() => handleAction(tx._id, 'lost')}
                            className="px-3 py-1.5 text-red-500/10 text-red-500 text-xs font-bold rounded-lg hover:-red-500 hover:text-slate-900 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <AlertOctagon size={13} />
                            <span>Lost</span>
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                            <path d="M8.5 2.5L4 7 1.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                          Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-20 text-slate-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        transaction={selectedTxn}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <LateReturnModal
        isOpen={!!lateReturnTxn}
        onClose={() => setLateReturnTxn(null)}
        transaction={lateReturnTxn}
      />
    </div>
  )
}
