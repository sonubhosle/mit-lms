"use client"

import { useState, useEffect } from 'react'
import { Bell, Search, Clock, UserRound } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/lib/useAuth'

export default function TopBar({ title }) {
  const [time, setTime] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-white/60 mx-8 mt-6 rounded-2xl flex items-center justify-between px-8 sticky top-6 z-30">
      <div>
        <h2 className="text-2xl font-black bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h2>
      </div>

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold border border-slate-100">
          <Clock size={16} className="text-indigo-500" />
          <span className="tracking-wide">{time ? format(time, 'hh:mm:ss a') : '--:--:-- --'}</span>
        </div>

        <button className="relative w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-md shadow-slate-200/50 text-slate-500 hover:text-indigo-600 hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all">
          <Bell size={22} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-[2.5px] border-white"></span>
        </button>

        <div className="flex items-center gap-4 pl-2">
          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
            <UserRound size={20} />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
