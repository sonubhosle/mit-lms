"use client"

import { useState } from 'react'
import { Download, RotateCcw, AlertOctagon, FileText } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import useSWR, { mutate } from 'swr'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Real-time circulation tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            placeholder="Status"
            className="w-40"
          />
          <button className="cursor-pointer flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download size={18} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white  ">
        <table className="animate-fade-in w-full text-left border-collapse [&_th]:border-b-2 [&_th]:border-slate-100  [&_th]:text-slate-500 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50  [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Issued</th>
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
                <tr
                  key={tx._id}
                  className={clsx(
                    'transition-colors duration-200',
                    tx.status === 'lost' ? 'bg-rose-50/60 hover:bg-rose-100/60' : 'bg-white hover:bg-slate-50'
                  )}
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{tx.memberId?.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{tx.memberId?.memberId}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-bold text-slate-900 text-sm line-clamp-1">{tx.bookId?.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium italic">{tx.remarks || 'Standard Issue'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-600 text-[13px] font-medium">
                      {format(new Date(tx.issueDate), 'dd MMM')}
                      <span className="text-slate-500 ml-1 text-[11px] font-normal">{format(new Date(tx.issueDate), 'yyyy')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div className={clsx(
                      'text-[13px] font-medium',
                      tx.status === 'overdue' ? 'text-rose-500' : 'text-slate-600'
                    )}>
                      {format(new Date(tx.dueDate), 'dd MMM')}
                      <span className="text-slate-500 ml-1 text-[11px] font-normal">{format(new Date(tx.dueDate), 'yyyy')}</span>

                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    {tx.fineAmount > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-900 font-black text-sm">₹{tx.fineAmount}</span>
                        <Badge variant={tx.finePaid ? 'success' : 'danger'} className="text-[8px] py-0.5 px-2 w-fit">
                          {tx.finePaid ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-medium text-sm">₹0</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePrintClick(tx)}
                        title="Invoice & Payment"
                        className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-violet-500 to-indigo-600 text-white rounded-2xl px-4 py-2 hover:from-violet-600 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 font-bold text-xs"
                      >
                        <FileText size={14} />
                        <span>Invoice</span>
                      </button>

                      {tx.status === 'issued' || tx.status === 'overdue' ? (
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoading === tx._id}
                            onClick={() => setLateReturnTxn(tx)}
                            className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-2xl px-4 py-2 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 font-bold text-xs disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                            <span>Return</span>
                          </button>
                          <button
                            disabled={actionLoading === tx._id}
                            onClick={() => handleAction(tx._id, 'lost')}
                            className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-2xl px-4 py-2 hover:from-rose-600 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 font-bold text-xs disabled:opacity-50"
                          >
                            <AlertOctagon size={14} />
                            <span>Lost</span>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-2xl border border-slate-100 uppercase tracking-widest cursor-default">
                          <div className="w-1 h-1 rounded-full bg-slate-300 animate-pulse" />
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
