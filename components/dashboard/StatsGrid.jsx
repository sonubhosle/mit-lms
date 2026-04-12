import StatCard from '@/components/ui/StatCard'
import { Book, Users, ClipboardCheck, AlertCircle } from 'lucide-react'

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Books" 
        value={stats?.totalBooks || 0} 
        icon={Book} 
        trend="up" 
        trendValue={12} 
        color="from-blue-500 to-indigo-600 shadow-blue-500/40" 
      />
      <StatCard 
        title="Total Members" 
        value={stats?.totalMembers || 0} 
        icon={Users} 
        trend="up" 
        trendValue={5} 
        color="from-purple-500 to-fuchsia-600 shadow-purple-500/40" 
      />
      <StatCard 
        title="Issued Today" 
        value={stats?.issuedToday || 0} 
        icon={ClipboardCheck} 
        trend="down" 
        trendValue={2} 
        color="from-amber-400 to-orange-500 shadow-amber-500/40" 
      />
      <StatCard 
        title="Overdue Books" 
        value={stats?.overdueCount || 0} 
        icon={AlertCircle} 
        trend="up" 
        trendValue={8} 
        color="from-rose-500 to-red-600 shadow-rose-500/40" 
      />
    </div>
  )
}
