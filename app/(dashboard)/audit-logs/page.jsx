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
    if (action.includes('DELETE')) return 'text-danger'
    if (action.includes('ADD') || action.includes('ISSUE')) return 'text-success'
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-gold'
    return 'text-navy'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-navy">Audit Logs</h1>
        <p className="text-slate font-medium">Complete history of all critical system operations and user actions</p>
      </div>

      <div className="table-container bg-white shadow-soft">
        <table>
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
                    <div className="flex items-center gap-2 text-navy font-bold">
                      <Clock size={14} className="text-slate" />
                      {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-navy">{log.userId?.name}</div>
                    <div className="text-xs text-slate uppercase tracking-wider">{log.userId?.role}</div>
                  </td>
                  <td>
                    <span className={clsx("font-bold text-xs uppercase tracking-widest", getActionColor(log.action))}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <code className="text-[10px] bg-gray-50 p-2 rounded block break-all max-w-[300px]">
                      {JSON.stringify(log.details)}
                    </code>
                  </td>
                  <td className="text-slate font-mono text-xs">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-20 text-slate">No logs found.</td>
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
            className="px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-navy hover:bg-gray-50 transition-all disabled:opacity-50 shadow-soft"
          >
            Previous
          </button>
          <span className="font-bold text-navy">Page {page} of {data.pagination.pages}</span>
          <button 
            disabled={page === data.pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-white border border-gray-100 rounded-xl font-bold text-navy hover:bg-gray-50 transition-all disabled:opacity-50 shadow-soft"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
