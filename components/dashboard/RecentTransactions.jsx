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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-navy">Recent Transactions</h3>
        <button className="text-gold font-bold text-sm hover:underline">View All</button>
      </div>
      <div className="table-container">
        <table>
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
                <td className="font-medium text-navy">{tx.memberId?.name}</td>
                <td className="text-slate">{tx.bookId?.title}</td>
                <td className="text-slate text-sm">
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
                <td colSpan="4" className="text-center py-8 text-slate">
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
