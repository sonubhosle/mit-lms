import { Plus, RefreshCw, UserPlus, FileText } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { label: 'Issue Book', icon: RefreshCw, color: 'bg-gold', href: '/transactions/issue' },
    { label: 'Return Book', icon: RefreshCw, color: 'bg-navy', href: '/transactions/return' },
    { label: 'Add Book', icon: Plus, color: 'bg-success', href: '/books/add' },
    { label: 'Add Member', icon: UserPlus, color: 'bg-blue-500', href: '/members/add' },
  ]

  return (
    <div className="card h-full">
      <h3 className="text-xl font-bold mb-6 text-navy">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => (
          <button 
            key={i}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-soft border border-transparent hover:border-gray-100 transition-all group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-bold text-navy">{action.label}</span>
          </button>
        ))}
      </div>
      <button className="w-full mt-6 py-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl text-slate font-bold hover:border-gold hover:text-gold transition-all">
        <FileText size={20} />
        <span>Generate Daily Report</span>
      </button>
    </div>
  )
}
