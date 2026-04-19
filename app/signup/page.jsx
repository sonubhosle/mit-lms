"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, User, Lock, Mail, Loader2, CheckCircle2, Eye, EyeOff, UserRound } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'
import clsx from 'clsx'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const { refresh } = useAuth()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Signup failed')
        setError(true)
        setLoading(false)
      } else {
        toast.success('Account created successfully!')
        setSuccess(true)
        await refresh()
        setTimeout(() => router.push('/'), 2000)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-100/70 via-white to-rose-100/70 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] text-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] text-amber-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className={clsx(
        "max-w-md w-full bg-white shadow-slate-200/50  border border-slate-100 rounded-4xl p-6 md:p-10 relative z-10 animate-fade-in shadow-2xl transition-all duration-300",
        error && "animate-shake"
      )}>
        <div className="flex gap-4  mb-6">
          <div className="w-18 h-18 border border-slate-100 bg-white shadow-slate-200/50 rounded-3xl flex items-center justify-center  shadowbg-amber-500/40 mb-6 transform hover:scale-110 transition-transform duration-500 overflow-hidden p-2">
            <img src="/assets/logo.png" alt="MIT College Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Mit Library</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[13px]">Administrative Access</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-10 space-y-6 animate-slide-in">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border  shadow-2xl shadow-success/20">
              <CheckCircle2 size={40} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Registration Success!</h3>
              <p className="text-slate-500">Your librarian account is ready.</p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-amber-500" size={24} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={22} />
                <input
                  required
                  placeholder="John Doe"
                  className="w-full  px-4 py-3 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={22} />
                <input
                  type="email"
                  required
                  placeholder="librarian@library.com"
                  className="w-full px-4 py-3 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={22} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 transition-all pr-14!"
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
              className="w-full  flex items-center justify-center gap-2  px-4 py-3 bg-linear-to-r from-amber-400 to-amber-500 text-white font-bold rounded-3xl transition-all duration-300 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 text-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already a member?{' '}
              <Link href="/login" className="text-amber-500 font-bold hover:underline decoration-gold/30 underline-offset-4 transition-all">
                Access portal
              </Link>
            </p>
          </form>
        )}

        <p className="mt-3 text-center text-slate-500/40 text-[10px] font-medium tracking-widest uppercase">
          Library Management System &bull; Secure Signup
        </p>
      </div>
    </div>
  )
}
