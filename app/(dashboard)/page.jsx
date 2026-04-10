"use client"

import useSWR from 'swr'
import StatsGrid from '@/components/dashboard/StatsGrid'
import ActivityChart from '@/components/dashboard/ActivityChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import QuickActions from '@/components/dashboard/QuickActions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 30000, // 30 seconds
  })

  if (error) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-red-100">
      <div className="text-danger font-bold text-xl mb-2">Failed to load dashboard data</div>
      <p className="text-slate">Please check your database connection and try again.</p>
    </div>
  )

  if (isLoading) return (
    <div className="h-[calc(100vh-200px)] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <StatsGrid stats={data} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActivityChart data={data?.chartData} />
          <RecentTransactions transactions={data?.recentTransactions} />
        </div>
        
        <div className="space-y-8">
          <QuickActions />
          <div className="card bg-navy text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
                <path d="M50 20V50L70 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h4 className="text-gold font-bold uppercase tracking-wider text-xs mb-2">System Status</h4>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Database Online</span>
            </div>
            <p className="text-slate-light text-sm mb-6 leading-relaxed">
              Automatic backup is scheduled for 12:00 AM tonight. All systems are operating normally.
            </p>
            <button className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg transition-all">
              View Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
