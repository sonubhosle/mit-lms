import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  return (
    <div className="group bg-white p-6 rounded-[2rem] shadow-sm shadow-slate-100 border border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-6">
      <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center bg-linear-to-tr shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-red-500" />
            )}
            <span className={clsx("text-xs font-bold", trend === 'up' ? '-emerald-500' : '-red-500')}>
              {trendValue}%
            </span>
            <span className="text-slate-500 text-xs">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  )
}
