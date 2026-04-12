import { Search, User, Book, Calendar, ChevronRight, Loader2, CheckCircle2, Download } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { format, addDays } from 'date-fns'
import clsx from 'clsx'
import { generateInvoice } from '@/lib/utils/generateInvoice'
import { useState, useEffect } from 'react'

export default function IssueBookForm({ onSuccess, initialBookId }) {
  const [step, setStep] = useState(1)
  const [memberSearch, setMemberSearch] = useState('')
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)

  const [bookSearch, setBookSearch] = useState('')
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)

  const [loading, setLoading] = useState(false)
  const [loanDays, setLoanDays] = useState(14)
  const [error, setError] = useState('')
  const [issuedTransaction, setIssuedTransaction] = useState(null)

  const computedDueDate = addDays(new Date(), loanDays)

  // Handle pre-selected book from inventory
  useEffect(() => {
    if (initialBookId) {
      async function fetchBook() {
        try {
          const res = await fetch(`/api/books/${initialBookId}`)
          const data = await res.json()
          if (res.ok) {
            setSelectedBook(data)
          }
        } catch (err) {
          console.error("Failed to fetch pre-selected book")
        }
      }
      fetchBook()
    }
  }, [initialBookId])

  const searchMembers = async (val) => {
    setMemberSearch(val)
    if (val.length < 2) return
    const res = await fetch(`/api/members?search=${val}&limit=5`)
    const data = await res.json()
    setMembers(data.members || [])
  }

  const searchBooks = async (val) => {
    setBookSearch(val)
    if (val.length < 2) return
    const res = await fetch(`/api/books?search=${val}&limit=5`)
    const data = await res.json()
    setBooks(data.books || [])
  }

  const handleIssue = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember._id,
          bookId: selectedBook._id,
          dueDateOverride: format(computedDueDate, 'yyyy-MM-dd')
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Construct a "full" transaction object for the invoice
      setIssuedTransaction({
        ...data,
        bookId: selectedBook,
        memberId: selectedMember
      })

      setStep(4)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      {/* ... Stepper logic stays same ... */}
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
        {/* Background Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-slate-100 z-0">
          <div
            className="h-full bg-slate-900 transition-all duration-500 ease-out"
            style={{ width: `${step === 4 ? 100 : ((step - 1) / 2) * 100}%` }}
          ></div>
        </div>

        {[1, 2, 3].map((s) => {
          const isActive = step === s
          const isCompleted = step > s

          return (
            <div key={s} className="flex flex-col items-center relative z-10">
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500",
                isCompleted ? "bg-slate-900 text-slate-900 shadow-lg" :
                  isActive ? "bg-slate-900 text-slate-900 shadow-xl shadow-slate-900/20 animate-ripple" :
                    "bg-slate-100 text-slate-500"
              )}>
                {isCompleted ? (
                  <CheckCircle2 size={24} className="text-amber-500 transition-all animate-in zoom-in" />
                ) : (
                  <span className="relative z-10">{s}</span>
                )}
              </div>
              <span className={clsx(
                "text-[10px] mt-3 font-bold uppercase tracking-[0.2em] transition-colors duration-500",
                step >= s ? "text-slate-900" : "text-slate-500"
              )}>
                {s === 1 ? 'Member' : s === 2 ? 'Book' : 'Confirm'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="card p-10 shadow-soft animate-slide-in">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Identify Member</h3>
            <p className="text-sm text-slate-500 -mt-4">Search for the student who is borrowing the book</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Search by name, ID, or mobile..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50  border border-slate-100 rounded-2xl focus:ring-4 focus:-slate-900/5 focus:-slate-900 outline-none"
                value={memberSearch}
                onChange={(e) => searchMembers(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {members.map(m => (
                <button
                  key={m._id}
                  onClick={() => { setSelectedMember(m); setStep(selectedBook ? 3 : 2); }}
                  className="w-full flex items-center gap-4 p-4 hover:-slate-900/5 border border-slate-100 rounded-2xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-900 font-bold">
                    {m.name[0]}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-slate-900 font-bold">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.memberId} • {m.className}</div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:-slate-900" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Select Book</h3>
              <div className="text-xs font-bold uppercase px-3 py-1 text-slate-900 rounded-full">Borrower: {selectedMember.name}</div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Search by title, author, or ISBN..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50  border border-slate-100 rounded-2xl focus:ring-4 focus:-slate-900/5 focus:-slate-900 outline-none"
                value={bookSearch}
                onChange={(e) => searchBooks(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {books.map(b => (
                <button
                  key={b._id}
                  disabled={b.availableCopies === 0}
                  onClick={() => { setSelectedBook(b); setStep(3); }}
                  className="w-full flex items-center gap-4 p-4 hover:-slate-900/5 border border-slate-100 rounded-2xl transition-all group disabled:opacity-50"
                >
                  <div className="w-10 h-14  rounded flex items-center justify-center bg-slate-900 border border-slate-200">
                    <Book size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-slate-900 font-bold">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.author} • {b.availableCopies} available</div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500 group-hover:-slate-900" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-slate-500 text-sm font-bold hover:-slate-900 uppercase tracking-wider">Back to member search</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Finalize Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 border  rounded-2xl border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Borrower</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bgbg-slate-900 text-white flex items-center justify-center font-bold">
                    {selectedMember.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{selectedMember.name}</div>
                    <div className="text-sm text-slate-500">{selectedMember.memberId}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50  rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Book Selection</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-14 bgbg-slate-900 text-white flex items-center justify-center rounded shadow-md">
                    <Book size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 line-clamp-1">{selectedBook.title}</div>
                    <div className="text-sm text-slate-500">{selectedBook.isbn}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6 rounded-2xl border text-amber-500/10">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Calendar size={14} className="text-amber-500" />
                Loan Duration (Days)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={loanDays}
                    onChange={(e) => setLoanDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-5 py-3 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-xl focus:ring-4 focus:-amber-500/10 focus:-amber-500 outline-none font-black text-2xl text-slate-900 text-center"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">days</span>
                </div>
                <div className="text-center bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-xl px-5 py-3 min-w-[160px]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Due Date</p>
                  <p className="text-slate-900 font-bold text-base">{format(computedDueDate, 'dd MMM yyyy')}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-700 opacity-60 italic">* ₹10/day penalty applied after the due date</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl text-red-500 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(selectedBook && initialBookId ? 1 : 2)}
                className="flex-1 py-4 border-2 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 border-slate-100 transition-all"
              >
                Change {initialBookId ? 'Member' : 'Book'}
              </button>
              <button
                onClick={handleIssue}
                disabled={loading}
                className="flex-1 relative overflow-hidden bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95 transition-all duration-300 rounded-2xl py-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : "Confirm & Issue Book"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={64} />
            </div>
            <h3 className="text-4xl font-serif font-bold text-slate-900">Book Issued!</h3>
            <p className="text-slate-500 text-lg max-w-sm mx-auto">
              Please remind <strong>{selectedMember.name}</strong> to return the book by <strong>{format(computedDueDate, 'dd MMMM yyyy')}</strong>.
            </p>
            <div className="flex flex-col items-center gap-4 pt-6">
              <div className="flex gap-4 w-full max-w-md">
                <button
                  onClick={() => generateInvoice(issuedTransaction)}
                  className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:-slate-950 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Receipt
                </button>
                <button
                  onClick={() => { setStep(1); setMemberSearch(''); setBookSearch(''); setSelectedBook(null); setIssuedTransaction(null); }}
                  className="flex-1 py-4  text-slate-500 font-bold rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all"
                >
                  Issue Another
                </button>
              </div>
              <button onClick={onSuccess} className="text-amber-500 font-bold hover:underline">Return to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
