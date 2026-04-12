"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Save, UserPlus, Loader2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function MemberModal({ isOpen, onClose, member, onSave }) {
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

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-4xl max-w-3xl overflow-hidden  text-slate-900`}>
        <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between text-white border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{member ? 'Edit Member' : 'New Member Registration'}</h3>
              <p className="text-xs text-slate-500 opacity-80 uppercase tracking-widest font-bold">Standard Data Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white shadow-xl shadow-slate-200/50/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name *</label>
              <input
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:-amber-500/10 focus:-amber-500 outline-none transition-all"
                placeholder="FullName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Class (Course) *</label>

              {/* Custom Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 ${isDropdownOpen ? '-amber-500 ring-4 text-amber-500/10' : 'border-slate-100'} rounded-2xl transition-all flex items-center justify-between text-left font-bold text-slate-900`}
                >
                  <span>{formData.className}</span>
                  <ChevronDown size={20} className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Smooth Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl z-50 overflow-hidden">
                    {classOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, className: opt });
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 border border-slate-100 transition-colors font-bold ${formData.className === opt ? 'text-amber-500 bg-amber-50' : 'text-slate-900'}`}
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
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:-amber-500/10 focus:-amber-500 outline-none transition-all font-medium"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile No *</label>
              <input
                required
                className="w-full px-5 py-4 bg-slate-50 border  border-slate-100 rounded-2xl focus:ring-4 focus:-amber-500/10 focus:-amber-500 outline-none transition-all font-medium"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>



          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
            <textarea
              className="w-full px-5 py-4 bg-slate-50  border border-slate-100 rounded-2xl focus:ring-4 focus:-amber-500/10 focus:-amber-500 outline-none transition-all h-28 resize-none font-medium"
              placeholder="Residential Address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl text-red-500 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4  rounded-2xl text-slate-500 font-bold hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 hover:opacity-90 disabled:opacity-50"
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
