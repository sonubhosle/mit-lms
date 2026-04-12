"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  RefreshCw,
  AlertCircle,
  BarChart3,
  History,
  Settings,
  LogOut
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/books', label: 'Books', icon: BookOpen },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/transactions', label: 'Transactions', icon: RefreshCw },
  { href: '/transactions/overdue', label: 'Overdue', icon: AlertCircle },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/audit-logs', label: 'Audit Logs', icon: History, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-[260px] bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] flex flex-col z-40 border border-white/60">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 rounded-xl flex items-center justify-center p-2">
            <img src="/assets/logo.png" alt="MIT Logo" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-tight">MIT<br /><span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Library</span></h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'superadmin') return null

          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold border border-transparent",
                isActive
                  ? "bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.02]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100"
              )}
            >
              <item.icon size={20} className={isActive ? "opacity-100" : "opacity-70"} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-50">
        <button
          onClick={() => logout()}
          className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl transition-all duration-300 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30"
        >
          <LogOut size={20} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  )
}
