import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Book } from 'lucide-react'

export default function RecentBooks({ books }) {
  return (
    <div className="bg-white p-8 rounded-4xl shadow-sm shadow-slate-100 border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 mb-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Recently Added Books</h3>
        <Link href="/books" className="text-amber-500 font-bold text-sm hover:underline">
          View All Library
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left border-collapse [&_th]:bg-slate-50 [&_th]:border-b [&_th]:border-slate-100 [&_th]:text-slate-600 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_tbody_tr]:bg-white [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 [&_tbody_tr]:transition-colors [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {(books || []).map((book) => (
              <tr key={book._id}>
                <td className="font-bold text-slate-900 truncate max-w-[150px]">{book.title}</td>
                <td className="text-slate-500 truncate max-w-[120px]">{book.author}</td>
                <td>
                  <Badge variant="info" className="uppercase text-[10px] tracking-wider">{book.genre}</Badge>
                </td>
                <td className="font-bold text-slate-700">{book.availableCopies}</td>
              </tr>
            ))}
            {(!books || books.length === 0) && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-500">
                  No books added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
