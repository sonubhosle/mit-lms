import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'

export default function RecentTransactions({ transactions }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'issued': return 'info'
      case 'returned': return 'success'
      case 'overdue': return 'danger'
      default: return 'info'
    }
  }

  return (
    <div className="bg-white p-8 rounded-4xl shadow-sm shadow-slate-100 border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 mb-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
        <button className="text-amber-500 font-bold text-sm hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse [&_th]:bg-slate-50 [&_th]:border-b [&_th]:border-slate-100 [&_th]:text-slate-600 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_tbody_tr]:bg-white [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 [&_tbody_tr]:transition-colors [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Member</th>
              <th>Book Title</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(transactions || []).map((tx) => (
              <tr key={tx._id}>
                <td className="font-medium text-slate-900">{tx.memberId?.name}</td>
                <td className="text-slate-500">{tx.bookId?.title}</td>
                <td className="text-slate-500 text-sm">
                  {format(new Date(tx.issueDate), 'dd MMM yyyy')}
                </td>
                <td>
                  <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                    {tx.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {(!transactions || transactions.length === 0) && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-500">
                  No recent transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
