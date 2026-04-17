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
    <aside className="fixed left-6 top-6 bottom-6 w-[300px] bg-white shadow-2xl shadow-slate-200/50 rounded-4xl flex flex-col z-40 border border-white/60">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 border border-slate-100 rounded-3xl p-2">
            <img src="/assets/logo.png" alt="MIT Logo" className="w-full h-full object-contain " />
          </div>

          <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-tight">MIT COLLEGE<br /><span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Library</span></h1>
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
                "flex group items-center gap-4 px-5 py-3 rounded-4xl transition-all duration-300 font-bold border border-transparent",
                isActive
                  ? "bg-linear-to-r from-violet-500  to-violet-700  text-white"
                  : "text-slate-600 hover:text-violet-900 hover:bg-slate-100 "
              )}
            >
              <item.icon size={20} className={isActive ? "opacity-100" : "opacity-70 group-hover:text-violet-700"} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-50">
        <button
          onClick={() => logout()}
          className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-linear-to-r from-rose-500 to-rose-600 text-white font-bold rounded-4xl transition-all duration-300"
        >
          <LogOut size={20} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  )
}
