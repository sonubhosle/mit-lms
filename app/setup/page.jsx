"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Shield, User, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'
import clsx from 'clsx'

export default function SetupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { refresh } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('System setup complete!')
        await refresh()
        router.push('/')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Setup failed')
        setError(true)
      }
    } catch (err) {
      toast.error('Setup failed')
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/assets/auth-bg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 md:p-8 relative overflow-hidden">


      <div className={clsx(
        "max-w-md w-full bg-white shadow-xl shadow-slate-200/50/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 md:p-10 relative z-10 animate-fade-in shadow-2xl transition-all duration-300",
        error && "animate-shake"
      )}>
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadowbg-amber-500/40 transform -rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden p-2">
            <img src="/assets/logo.png" alt="MIT College Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">MIT Setup</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Initialize Superadmin Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={18} />
              <input
                required
                placeholder="Super Admin"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="admin@library.com"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="input-field pr-14!"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:-amber-500 transition-colors p-2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <span>Complete Installation</span>
                <Shield size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-12 text-center text-slate-500/40 text-[10px] font-medium tracking-widest uppercase">
          MIT Library Systems &bull; System Initialization
        </p>
      </div>
    </div>
  )
}
