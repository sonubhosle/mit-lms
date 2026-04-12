"use client"

import { useState } from 'react'
import { History, Search, Filter, Shield, Clock } from 'lucide-react'
import useSWR from 'swr'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { format } from 'date-fns'
import clsx from 'clsx'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSWR(`/api/audit-logs?page=${page}`, fetcher)

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return '-red-500'
    if (action.includes('ADD') || action.includes('ISSUE')) return '-emerald-500'
    if (action.includes('UPDATE') || action.includes('EDIT')) return '-amber-500'
    return '-slate-900'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 font-medium">Complete history of all critical system operations and user actions</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 shadow-sm">
        <table className="w-full text-left border-collapse [&_th]:bg-slate-50 border border-slate-100 [&_th]:text-slate-500 [&_th]:font-bold [&_th]:py-4 [&_th]:px-6 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tbody_tr]:bg-white shadow-xl shadow-slate-200/50 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-slate-50 border border-slate-100 [&_tbody_tr]:transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50 border border-slate-100/50 [&_td]:py-4 [&_td]:px-6">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-20"><LoadingSpinner /></td>
              </tr>
            ) : data?.logs?.length > 0 ? (
              data.logs.map((log) => (
                <tr key={log._id}>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Clock size={14} className="text-slate-500" />
                      {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-900">{log.userId?.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">{log.userId?.role}</div>
                  </td>
                  <td>
                    <span className={clsx("font-bold text-xs uppercase tracking-widest", getActionColor(log.action))}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <code className="text-[10px] bg-slate-50 border border-slate-100 p-2 rounded block break-all max-w-[300px]">
                      {JSON.stringify(log.details)}
                    </code>
                  </td>
                  <td className="text-slate-500 font-mono text-xs">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-20 text-slate-500">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-6 py-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-xl font-bold text-slate-900 hover:bg-slate-50 border border-slate-100 transition-all disabled:opacity-50 shadow-soft"
          >
            Previous
          </button>
          <span className="font-bold text-slate-900">Page {page} of {data.pagination.pages}</span>
          <button 
            disabled={page === data.pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-xl font-bold text-slate-900 hover:bg-slate-50 border border-slate-100 transition-all disabled:opacity-50 shadow-soft"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
