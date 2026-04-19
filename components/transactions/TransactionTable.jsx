"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Download, RotateCcw, AlertOctagon, FileText, Trash2, MoreVertical } from 'lucide-react'
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

const RowActions = ({ tx, onPrint, onReturn, onLost, onDelete, actionLoading, index, total }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, showUp: false })
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownHeight = 280 // Estimated height of the menu
      const spaceBelow = window.innerHeight - rect.bottom
      const showUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight

      // Position it relative to the button
      setCoords({
        top: showUp ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 208, // 208 is the w-52 width
        showUp
      })
      setIsOpen(true)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const handleScroll = () => setIsOpen(false)

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", handleScroll)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleScroll)
    }
  }, [isOpen])

  const isActive = tx.status === 'issued' || tx.status === 'overdue'

  return (
    <div className="relative flex justify-end">
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className={clsx(
          "cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
          isOpen ? "bg-slate-900 text-white shadow-lg rotate-90" : "hover:bg-slate-100 text-slate-500"
        )}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && createPortal(
        <div 
          ref={menuRef}
          style={{ 
            position: 'fixed', 
            top: coords.showUp ? 'auto' : coords.top - window.scrollY, 
            bottom: coords.showUp ? (window.innerHeight - (coords.top - window.scrollY)) : 'auto',
            left: coords.left - window.scrollX,
            zIndex: 9999 
          }}
          className={clsx(
            "w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
            coords.showUp ? "origin-bottom-right" : "origin-top-right",
            isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          )}
        >
          <div className="p-2 space-y-1">
            <button
              onClick={() => { onPrint(tx); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
            >
              <FileText size={16} className="text-violet-500 group-hover:scale-110 transition-transform" />
              <span>View Invoice</span>
            </button>

            {isActive && (
              <>
                <button
                  onClick={() => { onReturn(tx); setIsOpen(false); }}
                  disabled={actionLoading === tx._id}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors group disabled:opacity-50"
                >
                  <RotateCcw size={16} className="text-emerald-500 group-hover:rotate-45 transition-transform" />
                  <span>Return Book</span>
                </button>
                <button
                  onClick={() => { onLost(tx._id, 'lost'); setIsOpen(false); }}
                  disabled={actionLoading === tx._id}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors group disabled:opacity-50"
                >
                  <AlertOctagon size={16} className="text-rose-500 group-hover:shake transition-transform" />
                  <span>Mark as Lost</span>
                </button>
              </>
            )}

            <div className="h-px bg-slate-100 my-1 mx-2" />

            <button
              onClick={() => { onDelete(tx._id); setIsOpen(false); }}
              disabled={actionLoading === tx._id}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group disabled:opacity-50"
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
              <span>Delete Record</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default function TransactionTable({ filter, title, subtitle }) {
  const [filterStatus, setFilterStatus] = useState(filter || '')
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY DELETE this transaction record? This cannot be undone.")) return
    
    setActionLoading(id)
    const t = toast.loading("Deleting transaction...")

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
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
          <h3 className="text-xl font-bold text-slate-900">
            {title || (filterStatus === 'issued,overdue' ? 'Active Issues' : 
             filterStatus === 'lost' ? 'Lost Books Registry' : 
             'Transaction History')}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {subtitle || (filterStatus === 'issued,overdue' ? 'Currently borrowed items and overdue books' : 
             filterStatus === 'lost' ? 'Tracking books reported as lost or missing' : 
             'Real-time circulation tracking')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!filter && (
            <CustomDropdown
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              placeholder="Status"
              className="w-40"
            />
          )}
          <button className="cursor-pointer flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download size={18} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
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
              data.map((tx, index) => (
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
                    <RowActions
                      tx={tx}
                      onPrint={handlePrintClick}
                      onReturn={setLateReturnTxn}
                      onLost={handleAction}
                      onDelete={handleDelete}
                      actionLoading={actionLoading}
                      index={index}
                      total={data.length}
                    />
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
