"use client"

import { useState, useEffect } from 'react'
import { Search, User, Book, Calendar, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { format, addDays } from 'date-fns'

export default function IssueBookForm({ onSuccess, initialBookId }) {
  const [step, setStep] = useState(1)
  const [memberSearch, setMemberSearch] = useState('')
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  
  const [bookSearch, setBookSearch] = useState('')
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'))
  const [error, setError] = useState('')

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
          dueDateOverride: dueDate
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep(4)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center relative z-10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-navy text-white' : 'bg-gray-100 text-slate'}`}>
              {step > s ? <CheckCircle2 size={24} className="text-gold" /> : s}
            </div>
            <span className={`text-xs mt-2 font-bold uppercase tracking-wider ${step >= s ? 'text-navy' : 'text-slate'}`}>
              {s === 1 ? 'Member' : s === 2 ? 'Book' : 'Confirm'}
            </span>
          </div>
        ))}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 z-0">
          <div className="h-full bg-navy transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        </div>
      </div>

      <div className="card p-10 shadow-soft animate-slide-in">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-navy">Identify Member</h3>
            <p className="text-sm text-slate -mt-4">Search for the student who is borrowing the book</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={20} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search by name, ID, or mobile..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none"
                value={memberSearch}
                onChange={(e) => searchMembers(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {members.map(m => (
                <button 
                  key={m._id}
                  onClick={() => { setSelectedMember(m); setStep(selectedBook ? 3 : 2); }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-navy/5 border border-gray-100 rounded-2xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-navy font-bold">
                    {m.name[0]}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-navy font-bold">{m.name}</div>
                    <div className="text-xs text-slate">{m.memberId} • {m.className}</div>
                  </div>
                  <ChevronRight size={20} className="text-slate group-hover:text-navy" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-serif font-bold text-navy">Select Book</h3>
              <div className="text-xs font-bold text-white uppercase px-3 py-1 bg-navy rounded-full">Borrower: {selectedMember.name}</div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={20} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search by title, author, or ISBN..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none"
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
                  className="w-full flex items-center gap-4 p-4 hover:bg-navy/5 border border-gray-100 rounded-2xl transition-all group disabled:opacity-50"
                >
                  <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center text-navy border border-gray-200">
                    <Book size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-navy font-bold">{b.title}</div>
                    <div className="text-xs text-slate">{b.author} • {b.availableCopies} available</div>
                  </div>
                  <ChevronRight size={20} className="text-slate group-hover:text-navy" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-slate text-sm font-bold hover:text-navy uppercase tracking-wider">Back to member search</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-serif font-bold text-navy">Finalize Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-slate uppercase mb-4 tracking-widest">Borrower</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-bold">
                    {selectedMember.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-navy">{selectedMember.name}</div>
                    <div className="text-sm text-slate">{selectedMember.memberId}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-slate uppercase mb-4 tracking-widest">Book Selection</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-14 bg-navy text-white flex items-center justify-center rounded shadow-md">
                    <Book size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-navy line-clamp-1">{selectedBook.title}</div>
                    <div className="text-sm text-slate">{selectedBook.isbn}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6 bg-gold/5 rounded-2xl border border-gold/10">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1 flex items-center gap-2">
                <Calendar size={14} className="text-gold" />
                Expected Return Date
              </label>
              <input 
                type="date"
                className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none font-bold"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="text-[10px] text-slate-dark opacity-60 italic">* ₹10/day penalty applied after this date</p>
            </div>

            {error && (
              <div className="bg-danger/10 p-4 rounded-xl text-danger text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(selectedBook && initialBookId ? 1 : 2)}
                className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-slate font-bold hover:bg-gray-50 transition-all"
              >
                Change {initialBookId ? 'Member' : 'Book'}
              </button>
              <button 
                onClick={handleIssue}
                disabled={loading}
                className="flex-2 bg-navy text-white py-4 rounded-2xl font-bold shadow-xl shadow-navy/20 hover:bg-navy-dark transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : "Confirm & Issue Book"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={64} />
            </div>
            <h3 className="text-4xl font-serif font-bold text-navy">Book Issued!</h3>
            <p className="text-slate text-lg max-w-sm mx-auto">
              Please remind **{selectedMember.name}** to return the book by **{format(new Date(dueDate), 'dd MMMM yyyy')}**.
            </p>
            <div className="flex flex-col items-center gap-4 pt-6">
              <button 
                onClick={() => { setStep(1); setMemberSearch(''); setBookSearch(''); setSelectedBook(null); }}
                className="px-8 py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-dark transition-all"
              >
                Issue Another Book
              </button>
              <button onClick={onSuccess} className="text-gold font-bold hover:underline">Return to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
