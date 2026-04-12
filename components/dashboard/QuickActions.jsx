import { Plus, RefreshCw, UserPlus, FileText } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { label: 'Issue Book', icon: RefreshCw, color: 'bg-amber-500', href: '/transactions/issue' },
    { label: 'Return Book', icon: RefreshCw, color: 'bg-slate-900', href: '/transactions/return' },
    { label: 'Add Book', icon: Plus, color: 'bg-emerald-500', href: '/books/add' },
    { label: 'Add Member', icon: UserPlus, color: 'bg-blue-500', href: '/members/add' },
  ]

  return (
    <div className="bg-white p-8 rounded-4xl shadow-sm shadow-slate-100 border border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
      <h3 className="text-xl font-bold mb-6 text-slate-900">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => (
          <button 
            key={i}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 hover:bg-white shadow-xl shadow-slate-200/50 hover:shadow-soft border border-transparent hover:border-slate-100 transition-all group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-bold text-slate-900">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
