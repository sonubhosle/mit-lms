"use client"

import { useState, useEffect } from 'react'
import { X, User, BookOpen, Phone, Mail, MapPin, Clock, AlertTriangle, CheckCircle2, IndianRupee, Calendar, Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import Badge from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { mutate } from 'swr'

export default function MemberDetailModal({ isOpen, onClose, member }) {
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

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!isOpen || !member) return
    setLoading(true)
    fetch(`/api/transactions?memberId=${member._id}`)
      .then(r => r.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [isOpen, member])

  if (!isOpen || !member) return null

  const activeIssues = transactions.filter(t => t.status === 'issued' || t.status === 'overdue')
  const history = transactions.filter(t => t.status !== 'issued' && t.status !== 'overdue')

  const handleDelete = async (txId) => {
    if (!window.confirm('Delete this transaction record?')) return
    setDeleting(txId)
    try {
      const res = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' })
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t._id !== txId))
        mutate(key => typeof key === 'string' && key.startsWith('/api/transactions'))
        toast.success('Record deleted')
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(null)
    }
  }

  const statusVariant = { issued: 'info', returned: 'success', overdue: 'danger', lost: 'danger' }

  return (
    <div className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-4xl w-full max-w-3xl max-h-[90vh] flex flex-col  overflow-hidden`}>

        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 text-amber-500/40 flex items-center justify-center font-black text-xl">
              {member.name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{member.name}</h2>
              <p className="text-slate-900/60 text-sm font-mono">{member.memberId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white shadow-xl shadow-slate-200/50/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-0 border-b border-slate-100">
            {[
              { icon: <User size={14} />, label: 'Class', value: member.className },
              { icon: <Mail size={14} />, label: 'Email', value: member.email || '—' },
              { icon: <Phone size={14} />, label: 'Phone', value: member.phone || '—' },
              { icon: <MapPin size={14} />, label: 'Address', value: member.address || '—' },
              { icon: <Calendar size={14} />, label: 'Joined', value: member.createdAt ? format(new Date(member.createdAt), 'dd MMM yyyy') : '—' },
              { icon: <IndianRupee size={14} />, label: 'Fines Due', value: member.finesDue > 0 ? `₹${member.finesDue}` : '₹0 (Clear)' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 border-b border-r border-gray-50">
                <span className="text-amber-500 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-slate-900 font-semibold text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-slate-100">
            <div className="text-center p-5">
              <p className="text-3xl font-black text-slate-900">{activeIssues.length}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Currently Issued</p>
            </div>
            <div className="text-center p-5">
              <p className="text-3xl font-black text-slate-900">{history.length}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">History Records</p>
            </div>
            <div className="text-center p-5">
              <p className={`text-3xl font-black ${member.finesDue > 0 ? '-red-500' : '-emerald-500'}`}>
                ₹{member.finesDue || 0}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Outstanding Fine</p>
            </div>
          </div>

          {/* Active Issues */}
          {activeIssues.length > 0 && (
            <div className="p-6">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} />
                Currently Issued Books
              </h3>
              <div className="space-y-3">
                {activeIssues.map(tx => (
                  <div key={tx._id} className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <BookOpen size={18} className="text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{tx.bookId?.title}</p>
                      <p className="text-xs text-slate-500">{tx.bookId?.isbn} · Due: <span className="font-semibold">{tx.dueDate ? format(new Date(tx.dueDate), 'dd MMM yyyy') : '—'}</span></p>
                    </div>
                    <Badge variant={statusVariant[tx.status] || 'info'}>{tx.status}</Badge>
                    <button onClick={() => handleDelete(tx._id)} disabled={deleting === tx._id} className="p-1.5 text-red-500/40 hover:-red-500 hover:-red-500/10 rounded-lg transition-all">
                      {deleting === tx._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="p-6 pt-0">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} />
              Transaction History
            </h3>
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No history records.</div>
            ) : (
              <div className="space-y-2">
                {history.map(tx => (
                  <div key={tx._id} className="flex items-center gap-4 p-4 border-slate-100 rounded-xl hover:bg-slate-50 border transition-colors group">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${tx.status === 'returned' ? 'bg-emerald-500' : '-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{tx.bookId?.title}</p>
                      <p className="text-[11px] text-slate-500">{tx.transactionId} · {tx.issueDate ? format(new Date(tx.issueDate), 'dd MMM yyyy') : '—'}</p>
                    </div>
                    {tx.fineAmount > 0 && (
                      <span className={`text-xs font-bold ${tx.finePaid ? '-emerald-500' : '-red-500'}`}>
                        ₹{tx.fineAmount} {tx.finePaid ? '✓' : '!'}
                      </span>
                    )}
                    <Badge variant={statusVariant[tx.status] || 'info'}>{tx.status}</Badge>
                    <button
                      onClick={() => handleDelete(tx._id)}
                      disabled={deleting === tx._id}
                      className="p-1.5 text-transparent group-hover:-red-500/40 hover:!-red-500 hover:-red-500/10 rounded-lg transition-all"
                    >
                      {deleting === tx._id ? <Loader2 size={14} className="animate-spin text-red-500" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-4 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 border-2 text-slate-500 font-bold rounded-xl hover:bg-slate-50 border-slate-100 transition-all text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
