"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
        setLoading(false)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gold/40 via-transparent to-transparent"></div>
        <div className="grid grid-cols-12 gap-4 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="flex justify-center items-center">
              <BookOpen size={40} className="text-white" />
            </div>
          ))}
        </div>
      </div>

      <div className={clsx(
        "w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-fade-in",
        error && "animate-shake"
      )}>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center shadow-lg shadow-gold/30 mb-6">
            <BookOpen className="text-navy" size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">Library Management</h1>
          <p className="text-slate-light font-medium uppercase tracking-wider text-sm">Librarian Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-light uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-navy-dark/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-light uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-navy-dark/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-light hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl py-3 px-4 text-danger text-sm text-center font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-navy-dark text-gold focus:ring-gold" />
              <span className="text-sm text-slate-light group-hover:text-white transition-colors">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg shadow-lg shadow-gold/20"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : "Login to Portal"}
          </button>
          <p className="mt-8 text-center text-sm text-slate-light">
            Don't have an account?{' '}
            <Link href="/signup" className="text-gold font-bold hover:underline transition-all">
              Register staff account
            </Link>
          </p>
        </form>

        <p className="mt-10 text-center text-slate-light text-xs font-medium">
          Version 1.0.0 &copy; 2026 Library MS
        </p>
      </div>
    </div>
  )
}
