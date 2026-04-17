"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Save, UserPlus, Loader2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function MemberModal({ isOpen, onClose, member, onSave }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    className: 'BCA',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const classOptions = ["BCA", "B.Sc CS"]

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

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        className: member.className || 'BCA',
        address: member.address || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        className: 'BCA',
        address: ''
      })
    }
    setError('')
  }, [member, isOpen])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const loadingToast = toast.loading(member ? 'Updating profile...' : 'Registering member...')

    try {
      const url = member ? `/api/members/${member._id}` : '/api/members'
      const method = member ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save member')

      toast.success(member ? 'Profile updated!' : 'Member registered successfully!', { id: loadingToast })
      onSave()
      onClose()
    } catch (err) {
      setError(err.message)
      toast.error(err.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  if (!isRendered) return null;

  return (
    <div className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-4xl w-full max-w-3xl overflow-hidden  text-slate-900`}>
        <div className=" p-6 flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-linear-to-r from-amber-500 to-amber-500 text-white rounded-3xl flex items-center justify-center  font-bold shadow-lg shadow-amber-500/20">
              <UserPlus size={27} />
            </div>
            <div>
              <h3 className="text-xl text-slate-800 font-bold">{member ? 'Update Member' : 'Register Member'}</h3>
              <p className="text-xs text-slate-500 opacity-80">Standard student data entry</p>
            </div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-12 h-12 bg-slate-50 border border-slate-100  rounded-xl transition-colors">
            <X size={25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name *</label>
              <input
                required
                className="w-full pl-4 mt-2 pr-4 py-3 border border-slate-100 focus:border-amber-400 rounded-2xl outline-none focus:ring-3 focus:ring-amber-500/20 transition ease-in duration-300"
                placeholder="FullName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Class (Course) *</label>

              {/* Custom Dropdown matched to premium style */}
              <div className="relative mt-2" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full pl-4 pr-4 py-3 border ${isDropdownOpen ? 'border-amber-400 ring-3 ring-amber-500/20' : 'border-slate-100'} rounded-2xl transition-all duration-300 flex items-center justify-between text-left font-bold text-slate-900 outline-none`}
                >
                  <span>{formData.className}</span>
                  <ChevronDown size={20} className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {classOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, className: opt });
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors font-bold ${formData.className === opt ? 'text-amber-500 bg-amber-50' : 'text-slate-900'}`}
                      >
                        <span>{opt}</span>
                        {formData.className === opt && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address *</label>
              <input
                type="email"
                required
                className="w-full pl-4 mt-2 pr-4 py-3 border border-slate-100 focus:border-amber-400 rounded-2xl outline-none focus:ring-3 focus:ring-amber-500/20 transition ease-in duration-300"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile No *</label>
              <input
                required
                className="w-full pl-4 mt-2 pr-4 py-3 border border-slate-100 focus:border-amber-400 rounded-2xl outline-none focus:ring-3 focus:ring-amber-500/20 transition ease-in duration-300"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
            <textarea
              className="w-full pl-4 mt-2 pr-4 py-3 border border-slate-100 focus:border-amber-400 rounded-2xl outline-none focus:ring-3 focus:ring-amber-500/20 transition ease-in duration-300 h-28 resize-none"
              placeholder="Residential Address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {error && (
            <div className="text-red-500/10 p-4 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border rounded-2xl text-slate-500 font-bold hover:bg-slate-50 border-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 relative overflow-hidden bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-95 transition-all duration-300 rounded-2xl py-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <Save size={20} />
                  <span>{member ? 'Update' : 'Register'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
