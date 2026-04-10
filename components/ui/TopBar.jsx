"use client"

import { useState, useEffect } from 'react'
import { Bell, Search, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function TopBar({ title }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-2xl font-bold text-navy">{title}</h2>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={18} />
          <input 
            type="text" 
            placeholder="Search books, members..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl w-[300px] focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-slate font-medium">
          <Clock size={18} />
          <span>{format(time, 'hh:mm:ss a')}</span>
        </div>

        <button className="relative p-2 text-slate hover:text-navy transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  )
}
