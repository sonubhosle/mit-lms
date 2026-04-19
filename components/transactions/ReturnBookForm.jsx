"use client"

import { useState } from 'react'
import { Search, RotateCcw, Loader2, CheckCircle2, AlertCircle, IndianRupee, Book, X, Calendar as CalendarIcon, Download } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import clsx from 'clsx'
import { generateInvoice } from '@/lib/utils/generateInvoice'
import { toast } from 'react-hot-toast'

export default function ReturnBookForm({ onSuccess }) {
  const [txnSearch, setTxnSearch] = useState('')
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const searchTransaction = async (e) => {
    e.preventDefault()
    if (!txnSearch) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/transactions?search=${txnSearch}`)
      const data = await res.json()

      // Find an active issue OR a returned/lost book with unpaid fines
      const found = data.find(t =>
        (t.transactionId === txnSearch || t.bookId?.isbn === txnSearch) &&
        (t.status === 'issued' || (t.fineAmount > 0 && !t.finePaid))
      )

      if (!found) throw new Error('No active issue or unpaid fine found for this ID/ISBN')

      setTransaction(found)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Return failed')

      setTransaction(data.transaction) // Update with latest server state
      setSuccess(true)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateFine = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    if (today <= due) return 0
    return differenceInDays(today, due) * 10 // ₹10 per day as requested
  }

  const handlePayFine = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay_fine' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')

      setTransaction(data.transaction) // Update with latest session (finePaid will be true)
      toast.success("Payment recorded successfully!")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto card p-10 text-center space-y-6 shadow-soft animate-fade-in border-2 text-emerald-500/20">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900">
          {transaction.status === 'lost' ? 'Loss Reported' : 'Book Returned'}
        </h3>
        <p className="text-slate-500 italic font-medium">"{transaction.bookId?.title}"</p>

        {transaction.fineAmount > 0 && !transaction.finePaid && (
          <div className="text-red-500/5 border p-6 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Fine Outstanding</p>
              <p className="text-4xl font-black text-red-500 mb-4 flex items-center justify-center gap-1">
                <IndianRupee size={28} /> {transaction.fineAmount}
              </p>
              <button
                onClick={handlePayFine}
                disabled={submitting}
                className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200/50"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <IndianRupee size={18} />
                    <span>Collect Fine & Mark as Paid</span>
                  </>
                )}
              </button>
            </div>
            <IndianRupee className="absolute -right-4 -bottom-4 text-red-500/5 group-hover:text-red-500/10 transition-colors" size={120} />
          </div>
        )}

        {transaction.finePaid && transaction.fineAmount > 0 && (
          <div className="text-emerald-500/5 border text-emerald-500/10 p-4 rounded-xl text-emerald-500 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            Fine Paid Successfully
          </div>
        )}

        <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={() => generateInvoice(transaction)}
            className="w-full py-5 bg-linear-to-r from-amber-500 to-orange-500 text-slate-900 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer"
          >
            <Download size={24} strokeWidth={3} />
            <span className="uppercase tracking-tight">Print Official Receipt</span>
          </button>

          <button
            onClick={() => { setSuccess(false); setTransaction(null); setTxnSearch(''); }}
            className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 border border-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Complete Transaction</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 animate-slide-in">
      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-4xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
        <div className="text-slate-900 p-8 text-slate-900 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center bg-slate-900 shadow-lg shadow-amber-500/20">
              <RotateCcw size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Return Book</h3>
              <p className="text-slate-500 opacity-80 text-sm">Close active transactions and update inventory</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {!transaction ? (
            <form onSubmit={searchTransaction} className="space-y-8 animate-fade-in">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Search size={14} className="text-amber-500" />
                  Find Active Transaction
                </label>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-500" size={20} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Scan ISBN or Enter Transaction ID..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-900 font-medium placeholder:text-gray-300"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-slate-500 opacity-70 ml-1 italic font-medium">
                  Tip: Most transactions are identified by IDs like "TXN-..."
                </p>
              </div>

              {error && (
                <div className="text-red-500/5 border text-red-500/10 p-5 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3 animate-shake">
                  <div className="w-8 h-8 text-red-500/10 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-5 text-slate-900 font-bold text-lg rounded-3xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={28} />
                ) : (
                  <>
                    <Search size={22} />
                    <span>Search Record</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-10 animate-fade-in">
              {/* Transaction Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 opacity-60">Borrower Information</p>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {transaction.memberId?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{transaction.memberId?.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{transaction.memberId?.memberId}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 opacity-60">Book Details</p>
                    <div className="flex items-center gap-4 p-4 text-amber-500/5 rounded-2xl border text-amber-500/10">
                      <div className="w-10 h-14 bg-white shadow-xl shadow-slate-200/50 shadow-sm rounded border border-slate-100 flex items-center justify-center bg-slate-900 shrink-0">
                        <Book size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 leading-tight truncate">{transaction.bookId?.title}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{transaction.bookId?.isbn}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl border border-slate-100 relative group overflow-hidden">
                  {/* Background icon decoration */}
                  <IndianRupee className="absolute -right-4 -bottom-4 text-gray-200/50 group-hover:text-amber-500/10 transition-colors" size={100} />

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest opacity-60">Due Date</p>
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-slate-900" />
                      <p className="font-bold text-slate-900 text-lg">{format(new Date(transaction.dueDate), 'dd MMMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest opacity-60">Outstanding Fine</p>
                    <div className={clsx(
                      "flex items-center gap-2 font-black text-4xl",
                      calculateFine(transaction.dueDate) > 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                      <IndianRupee size={32} strokeWidth={3} />
                      <span>{calculateFine(transaction.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setTransaction(null); setError(''); }}
                  className="flex-1 py-5 border-2 border-slate-100 rounded-3xl text-slate-500 font-bold hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>

                {/* If book is already returned/lost but has unpaid fine, show Pay button */}
                {transaction.status !== 'issued' && !transaction.finePaid ? (
                  <button
                    onClick={handlePayFine}
                    disabled={submitting}
                    className="flex-[1.5] bg-red-600 text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-200 hover:bg-red-700 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={28} />
                    ) : (
                      <>
                        <IndianRupee size={24} />
                        <span>Collect Fine (₹{transaction.fineAmount})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleReturn}
                    disabled={submitting}
                    className="flex-[1.5] bg-emerald-600 text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={28} />
                    ) : (
                      <>
                        <CheckCircle2 size={24} />
                        <span>Process Return</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
