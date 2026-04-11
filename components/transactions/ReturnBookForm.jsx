"use client"

import { useState } from 'react'
import { Search, RotateCcw, Loader2, CheckCircle2, AlertCircle, IndianRupee, Book, X, Calendar as CalendarIcon, Download } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import clsx from 'clsx'
import { generateInvoice } from '@/lib/utils/generateInvoice'

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
      const res = await fetch(`/api/transactions?search=${txnSearch}&status=issued`)
      const data = await res.json()
      
      // Look for specific TXN ID or ISBN
      const found = data.find(t => t.transactionId === txnSearch || t.bookId?.isbn === txnSearch)
      if (!found) throw new Error('Active transaction not found for this ID/ISBN')
      
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
      if (!res.ok) throw new Error('Return failed')
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

  if (success) {
    return (
      <div className="max-w-md mx-auto card p-10 text-center space-y-6 shadow-soft animate-fade-in">
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-navy">Book Returned</h3>
        <p className="text-slate">The transaction has been closed and stock incremented.</p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => generateInvoice(transaction)}
            className="w-full py-4 bg-navy text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy-dark transition-all"
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button 
            onClick={() => { setSuccess(false); setTransaction(null); setTxnSearch(''); }}
            className="w-full py-4 border-2 border-gray-100 text-slate rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            Return Another Book
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-slide-in">
      <div className="bg-white rounded-4xl shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5">
        <div className="bg-navy p-8 text-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-navy shadow-lg shadow-gold/20">
              <RotateCcw size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Return Book</h3>
              <p className="text-slate-light opacity-80 text-sm">Close active transactions and update inventory</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 md:p-10">
          {!transaction ? (
            <form onSubmit={searchTransaction} className="space-y-8 animate-fade-in">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Search size={14} className="text-gold" />
                  Find Active Transaction
                </label>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate transition-colors group-focus-within:text-gold" size={20} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Scan ISBN or Enter Transaction ID..."
                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all text-navy font-medium placeholder:text-gray-300"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-slate opacity-70 ml-1 italic font-medium">
                  Tip: Most transactions are identified by IDs like "TXN-..."
                </p>
              </div>

              {error && (
                <div className="bg-danger/5 border border-danger/10 p-5 rounded-2xl text-danger text-sm font-bold flex items-center gap-3 animate-shake">
                  <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-5 text-navy font-bold text-lg rounded-3xl shadow-xl shadow-gold/20 hover:shadow-gold/30 transition-all flex items-center justify-center gap-3"
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
                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-3 opacity-60">Borrower Information</p>
                    <div className="flex items-center gap-4 p-4 bg-navy-dark/5 rounded-2xl border border-navy/5">
                      <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {transaction.memberId?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-navy leading-tight">{transaction.memberId?.name}</p>
                        <p className="text-xs text-slate font-medium">{transaction.memberId?.memberId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-3 opacity-60">Book Details</p>
                    <div className="flex items-center gap-4 p-4 bg-gold/5 rounded-2xl border border-gold/10">
                      <div className="w-10 h-14 bg-white shadow-sm rounded border border-gray-100 flex items-center justify-center text-navy shrink-0">
                        <Book size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-navy leading-tight truncate">{transaction.bookId?.title}</p>
                        <p className="text-xs text-slate font-medium truncate">{transaction.bookId?.isbn}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group overflow-hidden">
                   {/* Background icon decoration */}
                  <IndianRupee className="absolute -right-4 -bottom-4 text-gray-200/50 group-hover:text-gold/10 transition-colors" size={100} />
                  
                  <div>
                    <p className="text-xs font-bold text-slate uppercase mb-1 tracking-widest opacity-60">Due Date</p>
                    <div className="flex items-center gap-2">
                       <CalendarIcon size={16} className="text-navy" />
                       <p className="font-bold text-navy text-lg">{format(new Date(transaction.dueDate), 'dd MMMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <p className="text-xs font-bold text-slate uppercase mb-2 tracking-widest opacity-60">Outstanding Fine</p>
                    <div className={clsx(
                      "flex items-center gap-2 font-black text-4xl",
                      calculateFine(transaction.dueDate) > 0 ? "text-danger" : "text-success"
                    )}>
                      <IndianRupee size={32} strokeWidth={3} />
                      <span>{calculateFine(transaction.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => { setTransaction(null); setError(''); }}
                  className="flex-1 py-5 border-2 border-gray-100 rounded-3xl text-slate font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Choose Different
                </button>
                <button 
                  onClick={handleReturn}
                  disabled={submitting}
                  className="flex-[1.5] bg-success text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-success/20 hover:bg-green-600 transition-all hover:-translate-y-1 active:translate-y-0"
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
