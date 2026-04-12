"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false) // Toggle for shake animation
  const { refresh } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Invalid credentials')
        setError(true)
        setLoading(false)
      } else {
        toast.success('Login successful!')
        await refresh()
        router.push('/')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/assets/auth-bg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 md:p-8 relative overflow-hidden">


      <div className={clsx(
        "w-full max-w-md bg-white shadow-xl shadow-slate-200/50/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 md:p-10 shadow-2xl relative z-10 animate-fade-in transition-all duration-300",
        error && "animate-shake"
      )}>
        <div className="flex gap-4  mb-6">
          <div className="w-18 h-18 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center shadow-2xl shadowbg-amber-500/40 mb-6 transform hover:scale-110 transition-transform duration-500 overflow-hidden p-2">
            <img src="/assets/logo.png" alt="MIT College Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Mit Library</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[13px]">Administrative Access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="librarian@library.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:-amber-500 transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field pr-14!"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:-amber-500 transition-colors p-2"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                <span>Sign In</span>
              </>
            )}
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            New staff member?{' '}
            <Link href="/signup" className="text-amber-500 font-bold hover:underline decoration-gold/30 underline-offset-4 transition-all">
              Register here
            </Link>
          </p>
        </form>

        <p className="mt-12 text-center text-slate-500/40 text-[10px] font-medium tracking-widest uppercase">
          &copy; 2026 Mit Library Systems &bull; Secure Access
        </p>
      </div>
    </div>
  )
}
