"use client"

import { useState, useEffect } from 'react'
import { X, Clock, IndianRupee, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { mutate } from 'swr'

const RATE = 10 // ₹ per day

export default function LateReturnModal({ isOpen, onClose, transaction }) {
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

  const [daysLate, setDaysLate] = useState(1)
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  if (!isOpen || !transaction) return null

  const fine = daysLate * RATE

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'return',
          manualFine: fine,
          daysLate,
          remarks: remarks || `Late return — ${daysLate} day(s) overdue`
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data.transaction)
      setDone(true)
      mutate(key => typeof key === 'string' && key.startsWith('/api/transactions'))
      toast.success('Late return processed!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDone(false)
    setResult(null)
    setDaysLate(1)
    setRemarks('')
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-[2rem] w-full max-w-md overflow-hidden `}>

        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-red-600 text-white px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white shadow-xl shadow-slate-200/50/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Late Return</h3>
              <p className="text-slate-900/70 text-xs font-mono">{transaction.transactionId}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white shadow-xl shadow-slate-200/50/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {done ? (
          /* Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Return Processed</h4>
            <div className="bg-slate-50 border border-slate-100 border border-slate-100 rounded-2xl p-5 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Book</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{transaction.bookId?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Member</span>
                <span className="font-semibold text-slate-900">{transaction.memberId?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Days Late</span>
                <span className="font-bold text-orange-600">{daysLate} day(s)</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 pt-2 mt-2">
                <span className="font-bold text-slate-900">Fine Charged</span>
                <span className="font-black text-red-500 text-base">₹{fine}</span>
              </div>
            </div>
            <button onClick={handleClose} className="w-full py-3 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg">
              Done
            </button>
          </div>
        ) : (
          /* Input State */
          <div className="p-7 space-y-6">
            {/* Book info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="font-bold text-slate-900 line-clamp-1">{transaction.bookId?.title}</p>
              <p className="text-xs text-slate-500 mt-1">{transaction.memberId?.name} · {transaction.memberId?.memberId}</p>
            </div>

            {/* Days input */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">
                How many days late?
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDaysLate(d => Math.max(1, d - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-gray-600 font-black text-xl hover:bg-gray-200 transition-colors flex items-center justify-center shadow-sm"
                >−</button>
                <input
                  type="number"
                  min="1"
                  value={daysLate}
                  onChange={e => setDaysLate(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center text-3xl font-black text-slate-900 py-3 border-2 border-slate-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner"
                />
                <button
                  onClick={() => setDaysLate(d => d + 1)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-gray-600 font-black text-xl hover:bg-gray-200 transition-colors flex items-center justify-center shadow-sm"
                >+</button>
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">@ ₹{RATE}/day</p>
            </div>

            {/* Fine Preview */}
            <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 shadow-sm">
              <span className="font-bold text-orange-700">Total Fine</span>
              <span className="text-3xl font-black text-orange-600 flex items-center gap-1">
                <IndianRupee size={20} />
                {fine}
              </span>
            </div>

            {/* Remarks */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Remarks (optional)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={`Late return — ${daysLate} day(s) overdue`}
                className="w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm bg-slate-50 border border-slate-100 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleClose} className="flex-1 py-4 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-4 bg-linear-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/30"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : (
                  <>
                    <Clock size={18} />
                    Process Late Return
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
