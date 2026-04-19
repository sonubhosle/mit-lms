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
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 transition-all duration-300">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MIT Central Management</p>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50/50 rounded-2xl text-slate-600 font-bold border border-slate-100/50">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs tabular-nums tracking-widest">
            {time ? format(time, 'hh:mm:ss a') : '--:--:-- --'}
          </span>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-100 pl-8">
          <div className="flex flex-col items-end mr-1">
            <p className="text-sm font-black text-slate-900">{user?.name}</p>
            <p className="text-[10px] text-violet-600 font-black uppercase tracking-tighter">{user?.role}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xl shadow-slate-200 transition-transform hover:scale-105 duration-300">
            <UserRound size={20} />
          </div>
        </div>
      </div>
    </header>
  )
}
