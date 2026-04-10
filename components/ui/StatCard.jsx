import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  return (
    <div className="card flex items-center gap-6 animate-fade-in">
      <div className={clsx("p-4 rounded-xl", color)}>
        <Icon size={32} className="text-white" />
      </div>
      <div>
        <p className="text-slate text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <TrendingUp size={16} className="text-success" />
            ) : (
              <TrendingDown size={16} className="text-danger" />
            )}
            <span className={clsx("text-xs font-bold", trend === 'up' ? 'text-success' : 'text-danger')}>
              {trendValue}%
            </span>
            <span className="text-slate text-xs">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  )
}
