"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, UserRound, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen bg-linear-to-br from-violet-100/70 via-white to-rose-100/70 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">


      <div className={clsx(
        "max-w-md w-full bg-white  shadow-slate-200/50  border border-slate-100 rounded-4xl p-6 md:p-10 relative z-10 animate-fade-in shadow-2xl transition-all duration-300",
        error && "animate-shake"
      )}>
        <div className="flex gap-4  mb-6">
          <div className="w-18 h-18 border border-slate-100 bg-white shadow-slate-200/50 rounded-3xl flex items-center justify-center  shadowbg-amber-500/40 mb-6 transform hover:scale-110 transition-transform duration-500 overflow-hidden p-2">
            <img src="/assets/logo.png" alt="MIT College Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Mit Setup</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[13px]">Admin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Admin Full Name</label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={22} />
              <input
                required
                placeholder="Super Admin"
                className="w-full  px-4 py-3 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={22} />
              <input
                type="email"
                required
                placeholder="admin@library.com"
                className="w-full  px-4 py-3 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={22} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full  px-4 py-3 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 transition-all pr-14!"
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
            className="w-full flex items-center justify-center gap-2  px-4 py-3 bg-linear-to-r from-amber-400 to-amber-500 text-white font-bold rounded-3xl transition-all duration-300 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Shield size={20} />
                <span>Register</span>

              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-slate-500/40 text-[10px] font-medium tracking-widest uppercase">
          MIT Library Systems &bull; System Initialization
        </p>
      </div>
    </div>
  )
}
