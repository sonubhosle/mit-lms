"use client"

import { useState } from 'react'
import { Search, RotateCcw, Loader2, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

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
    return differenceInDays(today, due) * 5 // 5 per day
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto card p-10 text-center space-y-6 shadow-soft animate-fade-in">
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-navy">Book Returned</h3>
        <p className="text-slate">The transaction has been closed and stock incremented.</p>
        <button 
          onClick={() => { setSuccess(false); setTransaction(null); setTxnSearch(''); }}
          className="btn-primary w-full py-4 text-navy font-bold"
        >
          Return Another Book
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="card p-10 shadow-soft">
        <h3 className="text-2xl font-serif font-bold text-navy mb-8">Return Book</h3>
        
        {!transaction ? (
          <form onSubmit={searchTransaction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Scan ISBN or Enter Transaction ID</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={20} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. TXN-123456789 or 978-0123..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none"
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="bg-danger/10 p-4 rounded-xl text-danger text-sm font-bold flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-navy font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Find Transaction"}
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold text-slate uppercase tracking-widest mb-1">Book</p>
                <p className="font-bold text-navy">{transaction.bookId?.title}</p>
                <p className="text-xs text-slate">{transaction.bookId?.isbn}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate uppercase tracking-widest mb-1">Member</p>
                <p className="font-bold text-navy">{transaction.memberId?.name}</p>
                <p className="text-xs text-slate">{transaction.memberId?.memberId}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate uppercase mb-1">Due Date</p>
                <p className="font-bold text-navy">{format(new Date(transaction.dueDate), 'dd MMM yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate uppercase mb-1">Estimated Fine</p>
                <div className="flex items-center gap-1 font-bold text-danger text-lg">
                  <IndianRupee size={16} />
                  <span>{calculateFine(transaction.dueDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setTransaction(null)}
                className="flex-1 py-4 border border-gray-200 rounded-2xl text-slate font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleReturn}
                disabled={submitting}
                className="flex-2 bg-success hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all"
              >
                {submitting ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <RotateCcw size={20} />
                    <span>Confirm Book Return</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
