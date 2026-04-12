"use client"

import useSWR from 'swr'
import StatsGrid from '@/components/dashboard/StatsGrid'
import ActivityChart from '@/components/dashboard/ActivityChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import RecentBooks from '@/components/dashboard/RecentBooks'
import QuickActions from '@/components/dashboard/QuickActions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 30000, // 30 seconds
  })

  if (error) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-red-100">
      <div className="text-red-500 font-bold text-xl mb-2">Failed to load dashboard data</div>
      <p className="text-slate-500">Please check your database connection and try again.</p>
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
        </div>

        <div className="space-y-8">
          <QuickActions />

        </div>
      </div>

      <div className="flex flex-col space-y-8 pt-2">
        <RecentTransactions transactions={data?.recentTransactions} />
        <RecentBooks books={data?.recentBooks} />
      </div>
    </div>
  )
}
