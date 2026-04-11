"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, User, Lock, Mail, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
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
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px]"></div>
      </div>

      <div className={clsx(
        "max-w-md w-full glass-card relative z-10 animate-fade-in shadow-2xl transition-all duration-300",
        error && "animate-shake"
      )}>
        <div className="flex gap-4  mb-6">
          <div className="w-18 h-18 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-gold/40 mb-6 transform hover:scale-110 transition-transform duration-500 overflow-hidden p-2">
            <img src="/assets/logo.png" alt="MIT College Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">Mit Library</h1>
            <p className="text-slate-light font-medium uppercase tracking-widest text-[13px]">Administrative Access</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-10 space-y-6 animate-slide-in">
            <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4 border border-success/30 shadow-2xl shadow-success/20">
              <CheckCircle2 size={40} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Registration Success!</h3>
              <p className="text-slate-light">Your librarian account is ready.</p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-gold" size={24} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light group-focus-within:text-gold transition-colors" size={18} />
                <input
                  required
                  placeholder="John Doe"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light group-focus-within:text-gold transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="librarian@library.com"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light group-focus-within:text-gold transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field !pr-14"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-light hover:text-gold transition-colors p-2"
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
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-light">
              Already a member?{' '}
              <Link href="/login" className="text-gold font-bold hover:underline decoration-gold/30 underline-offset-4 transition-all">
                Access portal
              </Link>
            </p>
          </form>
        )}

        <p className="mt-12 text-center text-slate-light/40 text-[10px] font-medium tracking-widest uppercase">
          Library Management System &bull; Secure Signup
        </p>
      </div>
    </div>
  )
}
