"use client"

import { useState } from 'react'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Printer, 
  Calendar as CalendarIcon,
  TrendingUp,
  Book as BookIcon,
  Users as UsersIcon
} from 'lucide-react'
import useSWR from 'swr'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ReportsPage() {
  const { data: dailyStats, isLoading: loadingDaily } = useSWR('/api/reports?type=daily', fetcher)
  const { data: topBooks, isLoading: loadingTop } = useSWR('/api/reports?type=top-books', fetcher)

  const printReport = () => {
    window.print()
  }

  return (
    <div className="space-y-8 animate-fade-in print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy">Library Reports</h1>
          <p className="text-slate font-medium">Analytical insights and detailed inventory reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={printReport} className="btn-secondary px-5 py-3">
            <Printer size={20} />
            <span>Print Report</span>
          </button>
          <button className="btn-primary px-6 py-3 shadow-lg shadow-gold/20">
            <Download size={20} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-8 bg-gold/5 border border-gold/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gold text-navy rounded-xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-slate text-xs font-bold uppercase tracking-wider">Issues Today</p>
              <h3 className="text-3xl font-bold text-navy">{dailyStats?.issues || 0}</h3>
            </div>
          </div>
          <div className="text-xs text-slate font-medium">+15% from yesterday</div>
        </div>
        <div className="card p-8 bg-success/5 border border-success/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-success text-white rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate text-xs font-bold uppercase tracking-wider">Returns Today</p>
              <h3 className="text-3xl font-bold text-navy">{dailyStats?.returns || 0}</h3>
            </div>
          </div>
          <div className="text-xs text-slate font-medium">85% return rate</div>
        </div>
        <div className="card p-8 bg-navy/5 border border-navy/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center">
              <UsersIcon size={24} />
            </div>
            <div>
              <p className="text-slate text-xs font-bold uppercase tracking-wider">Fines Collected</p>
              <h3 className="text-3xl font-bold text-navy">₹{dailyStats?.finesCollected || 0}</h3>
            </div>
          </div>
          <div className="text-xs text-slate font-medium">Daily balance updated</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card h-[450px]">
          <h3 className="text-xl font-bold text-navy mb-8 border-b border-gray-100 pb-4">Most Popular Books</h3>
          {loadingTop ? <LoadingSpinner /> : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBooks?.map(b => ({ name: b.book.title, count: b.count }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-navy mb-8 border-b border-gray-100 pb-4">Inventory Distribution</h3>
          <div className="space-y-6">
            {[
              { label: 'Fiction', value: 45, color: '#F59E0B' },
              { label: 'Science', value: 25, color: '#0F172A' },
              { label: 'History', value: 15, color: '#64748B' },
              { label: 'Others', value: 15, color: '#E2E8F0' },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-navy">{cat.label}</span>
                  <span className="text-slate">{cat.value}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.value}%`, backgroundColor: cat.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-navy text-white rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Weekly Growth</p>
              <h4 className="text-2xl font-bold">+128 New Books</h4>
              <p className="text-white/60 text-xs mt-2">Inventory increased by 4.2% this week</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
