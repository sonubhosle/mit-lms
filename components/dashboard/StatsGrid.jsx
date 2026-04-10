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
        color="bg-blue-500" 
      />
      <StatCard 
        title="Total Members" 
        value={stats?.totalMembers || 0} 
        icon={Users} 
        trend="up" 
        trendValue={5} 
        color="bg-purple-500" 
      />
      <StatCard 
        title="Issued Today" 
        value={stats?.issuedToday || 0} 
        icon={ClipboardCheck} 
        trend="down" 
        trendValue={2} 
        color="bg-gold" 
      />
      <StatCard 
        title="Overdue Books" 
        value={stats?.overdueCount || 0} 
        icon={AlertCircle} 
        trend="up" 
        trendValue={8} 
        color="bg-danger" 
      />
    </div>
  )
}
