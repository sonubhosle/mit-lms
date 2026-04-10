"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Save, UserPlus, Loader2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function MemberModal({ isOpen, onClose, member, onSave }) {
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
    <div className="modal-overlay">
      <div className="bg-white rounded-4xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-navy">
        <div className="bg-navy p-6 flex items-center justify-between text-white border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-navy font-bold shadow-lg shadow-gold/10">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{member ? 'Edit Member' : 'New Member Registration'}</h3>
              <p className="text-xs text-slate-light opacity-80 uppercase tracking-widest font-bold">Standard Data Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Full Name *</label>
            <input 
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all font-bold text-lg"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Email Address *</label>
              <input 
                type="email"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all font-medium"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Mobile No *</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all font-medium"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Class (Course) *</label>
            
            {/* Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full px-5 py-4 bg-gray-50 border ${isDropdownOpen ? 'border-gold ring-4 ring-gold/10' : 'border-gray-100'} rounded-2xl transition-all flex items-center justify-between text-left font-bold text-navy`}
              >
                <span>{formData.className}</span>
                <ChevronDown size={20} className={`text-slate transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Smooth Dropdown Content */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-in-top">
                  {classOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, className: opt });
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors font-bold ${formData.className === opt ? 'text-gold bg-gold/5' : 'text-navy'}`}
                    >
                      <span>{opt}</span>
                      {formData.className === opt && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate uppercase tracking-wider ml-1">Address</label>
            <textarea 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none transition-all h-28 resize-none font-medium"
              placeholder="Residential Address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-danger/10 p-4 rounded-xl text-danger text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl text-slate font-bold hover:bg-gray-50 hover:border-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold text-navy py-4 rounded-2xl font-bold shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all flex items-center justify-center gap-2 transform active:scale-95"
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
