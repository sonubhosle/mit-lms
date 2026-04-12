"use client"

import { useState, useEffect } from 'react'
import { X, CheckCircle2, FileText, IndianRupee, Download, Loader2, Calculator, AlertTriangle } from 'lucide-react'
import { generateInvoice } from '@/lib/utils/generateInvoice'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

const RATE_PER_DAY = 10

export default function PaymentModal({ isOpen, onClose, transaction: initialTxn, onPaymentSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [mode, setMode] = useState('auto') // 'auto' | 'manual'
  const [daysLate, setDaysLate] = useState('')
  const [customRemarks, setCustomRemarks] = useState('')

  // Sync local state when transaction prop changes
  const tx = transaction || initialTxn

  if (!isOpen || !tx) return null

  const isLost = tx.status === 'lost'
  const bookPrice = tx.bookId?.price || 0
  const isPaid = tx.finePaid || tx.fineAmount === 0
  
  // Compute fine for display
  const autoFine = tx.fineAmount || 0
  const manualFine = mode === 'manual' 
    ? (parseInt(daysLate) || 0) * RATE_PER_DAY + (isLost ? bookPrice : 0)
    : autoFine
  const displayFine = mode === 'manual' ? manualFine : autoFine
  const manualDaysLate = mode === 'manual' ? (parseInt(daysLate) || 0) : null

  const handlePay = async () => {
    setLoading(true)
    try {
      const body = { action: 'pay_fine' }
      if (mode === 'manual' && manualFine !== autoFine) {
        // First update the fine amount, then mark paid in same call
        body.manualFine = manualFine
        body.daysLate = manualDaysLate
      }

      const res = await fetch(`/api/transactions/${tx._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      
      toast.success("Payment recorded successfully!")
      setTransaction(data.transaction)
      if (onPaymentSuccess) onPaymentSuccess(data.transaction)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    generateInvoice(tx)
  }

  const handleClose = () => {
    setTransaction(null)
    setMode('auto')
    setDaysLate('')
    setCustomRemarks('')
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden `}>
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center bg-slate-900">
              <FileText size={20} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Invoice & Payment</h3>
              <p className="text-[11px] text-slate-900/60 font-mono">{tx.transactionId}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white shadow-xl shadow-slate-200/50/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Member & Book Summary */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl border border-slate-100">
            <div className="w-11 h-11 bg-slate-900 rounded-full flex items-center justify-center font-black text-white text-lg">
              {tx.memberId?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{tx.memberId?.name}</p>
              <p className="text-xs text-slate-500 truncate">{tx.bookId?.title}</p>
            </div>
            <span className={clsx(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              tx.status === 'returned' ? 'bg-green-100 text-green-700' :
              tx.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            )}>
              {tx.status}
            </span>
          </div>

          {/* Fine Calculator */}
          {!isPaid && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Calculator size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fine Calculation</span>
              </div>
              
              {/* Mode Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setMode('auto')}
                  className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition-all", mode === 'auto' ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900 shadow-sm' : 'text-slate-500')}
                >
                  Auto-Calculated
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition-all", mode === 'manual' ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900 shadow-sm' : 'text-slate-500')}
                >
                  Manual Entry
                </button>
              </div>

              {mode === 'manual' ? (
                <div className="space-y-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Days Late</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={daysLate}
                        onChange={(e) => setDaysLate(e.target.value)}
                        placeholder="e.g. 6"
                        className="w-24 px-3 py-2 border border-slate-200 rounded-xl font-bold text-center text-slate-900 focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none"
                      />
                      <span className="text-sm text-slate-500 font-medium">× ₹{RATE_PER_DAY}/day = </span>
                      <span className="text-lg font-black text-red-500">₹{(parseInt(daysLate) || 0) * RATE_PER_DAY}</span>
                    </div>
                    {isLost && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-bold">
                        <AlertTriangle size={14} />
                        <span>+ Book Price: ₹{bookPrice} (lost)</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Librarian Remarks</label>
                    <input
                      type="text"
                      value={customRemarks}
                      onChange={(e) => setCustomRemarks(e.target.value)}
                      placeholder="Optional note for invoice..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:-amber-500/20 focus:-amber-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 border border-slate-100 px-4 py-3 rounded-xl">
                  Fine auto-calculated from the return date and due date. ₹10/day for late returns{isLost ? ' + full book price for lost books.' : '.'}
                </div>
              )}
            </div>
          )}

          {/* Fine Amount Display */}
          <div className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-3xl">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
                {isLost ? 'Total Penalty (Late + Lost)' : 'Late Return Fine'}
              </p>
              <p className="text-4xl font-black flex items-center gap-1">
                <IndianRupee size={26} /> {displayFine}
              </p>
              {mode === 'manual' && daysLate && (
                <p className="text-xs text-slate-900/60 mt-1">{daysLate} day(s) × ₹10{isLost ? ` + ₹${bookPrice} book price` : ''}</p>
              )}
            </div>
            <div className={clsx(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter",
              isPaid ? "text-emerald-500 text-slate-900" : "text-amber-500 text-slate-900"
            )}>
              {isPaid ? "✓ Paid" : "Pending"}
            </div>
          </div>

          {/* Pay Button */}
          {!isPaid ? (
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 relative overflow-hidden bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95 transition-all duration-300 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : (
                <>
                  <IndianRupee size={20} strokeWidth={3} />
                  Collect ₹{displayFine} & Mark as Paid
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 text-emerald-500/10 text-emerald-500 rounded-2xl font-bold text-sm border text-emerald-500/20">
              <CheckCircle2 size={22} />
              Fine of ₹{tx.fineAmount} collected & recorded
            </div>
          )}

          {/* Generate Invoice */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="py-3 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-slate-900/20"
            >
              <Download size={16} />
              Generate Invoice
            </button>
            <button
              onClick={handleClose}
              className="py-3 border-2 border-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 border border-slate-100 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
