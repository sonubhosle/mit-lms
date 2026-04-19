"use client"
import { useState, useMemo } from 'react'
import {

  FileText,
  Download,
  Printer,
  Calendar ,
  TrendingUp,
  Book as BookIcon,
  Users ,
  PieChart as PieIcon,
  TrendingDown,
  ArrowUpRight,
  Search,
  CheckCircle2,
} from 'lucide-react'
import useSWR from 'swr'
import {

  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { generateInvoice } from '@/lib/utils/generateInvoice'
import { toast } from 'react-hot-toast'
import clsx from 'clsx'

const fetcher = (url) => fetch(url).then((res) => res.json())

const MetricCard = ({ title, value, label, icon: Icon, color, trend }) => (
  <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
    <div className={clsx("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-2xl transition-all duration-500 group-hover:scale-150",
      color === 'amber' ? 'bg-amber-500' :
        color === 'emerald' ? 'bg-emerald-500' :
          color === 'indigo' ? 'bg-indigo-500' : 'bg-slate-500'
    )} />

    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
        color === 'amber' ? 'bg-amber-500 shadow-amber-200' :
          color === 'emerald' ? 'bg-emerald-500 shadow-emerald-200' :
            color === 'indigo' ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-900 shadow-slate-200'
      )}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={clsx("flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
          trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div className="relative z-10">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.1em] mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <span className="text-slate-400 text-xs font-bold">{label}</span>
      </div>
    </div>
  </div>
)

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#64748b', '#ec4899', '#8b5cf6', '#06b6d4']

export default function ReportsPage() {
  const { data: dailyStats } = useSWR('/api/reports?type=daily', fetcher)
  const { data: topBooks, isLoading: loadingTop } = useSWR('/api/reports?type=top-books', fetcher)
  const { data: trends, isLoading: loadingTrends } = useSWR('/api/reports?type=monthly-trends', fetcher)
  const { data: genreStats, isLoading: loadingGenres } = useSWR('/api/reports?type=genre-stats', fetcher)

  const [txnSearch, setTxnSearch] = useState('')
  const [searchingTxn, setSearchingTxn] = useState(false)
  const [foundTxn, setFoundTxn] = useState(null)

  const handleTxnSearch = async (e) => {
    e.preventDefault()
    if (!txnSearch) return
    setSearchingTxn(true)
    setFoundTxn(null)
    try {
      const res = await fetch(`/api/transactions?search=${txnSearch}`)
      const data = await res.json()
      if (data && data.length > 0) {
        setFoundTxn(data[0])
        toast.success("Transaction localized!")
      } else {
        toast.error("Record not found")
      }
    } catch (err) {
      toast.error("Processing error")
    } finally {
      setSearchingTxn(false)
    }
  }

  const chartData = useMemo(() => {
    return trends?.map(t => ({
      date: t._id,
      Issues: t.issues,
      Returns: t.returns
    })) || []
  }, [trends])

  const genreData = useMemo(() => {
    return genreStats?.slice(0, 5).map(g => ({
      name: g._id,
      value: g.value
    })) || []
  }, [genreStats])

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-violet-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2 transform transition-all duration-700 delay-100">
            <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            Live Analytics Dashboard
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time circulation metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-soft"
          >
            <Printer size={20} />
            <span>Generate Report</span>
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <Download size={20} />
            <span>Export XLS</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Daily Issues"
          value={dailyStats?.issues || 0}
          label="Today"
          icon={BookIcon}
          color="amber"
          trend={12}
        />
        <MetricCard
          title="Daily Returns"
          value={dailyStats?.returns || 0}
          label="Today"
          icon={TrendingUp}
          color="emerald"
          trend={8}
        />
        <MetricCard
          title="Revenue"
          value={`₹${dailyStats?.finesCollected || 0}`}
          label="Collected"
          icon={TrendingUp}
          color="indigo"
          trend={-5}
        />
        <MetricCard
          title="Top Genre"
          value={genreStats?.[0]?._id?.slice(0, 8) || 'N/A'}
          label="Most Popular"
          icon={PieIcon}
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-soft overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Circulation Trends</h3>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">Activity over last 30 days</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500 shadow-lg shadow-violet-200" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-200" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Returns</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full mt-4">
              {loadingTrends ? <LoadingSpinner /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(val) => val.split('-').slice(2).join('')}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="Issues" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorIssues)" />
                    <Area type="monotone" dataKey="Returns" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorReturns)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-soft">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Popular Titles</h3>
              <div className="space-y-5">
                {loadingTop ? <LoadingSpinner /> : topBooks?.slice(0, 5).map((b, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs transition-colors group-hover:bg-violet-50 group-hover:text-violet-600">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate group-hover:text-violet-600 transition-colors">{b.book.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(b.count / (topBooks?.[0].count || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{b.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-soft flex flex-col items-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 w-full text-left">Genre Focus</h3>
              <div className="h-[200px] w-full relative">
                {loadingGenres ? <LoadingSpinner /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genreData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{genreStats?.length || 0}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Genres</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {genreData.map((g, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{g.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 p-8 rounded-4xl shadow-2xl shadow-slate-400/20 relative overflow-hidden group h-fit">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl -ml-5 -mb-5" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/10">
                  <FileText className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Quick Invoice</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Instant Receipt Generator</p>
                </div>
              </div>

              <form onSubmit={handleTxnSearch} className="space-y-4">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-slate-500 group-focus-within/input:text-amber-500 transition-colors" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Transaction ID..."
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-white font-medium placeholder:text-slate-600"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchingTxn}
                  className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-2xl hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {searchingTxn ? <LoadingSpinner /> : (
                    <>
                      <Search size={18} strokeWidth={3} />
                      <span>Process Search</span>
                    </>
                  )}
                </button>
              </form>

              {foundTxn && (
                <div className="mt-6 p-5 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-white animate-scale-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Record Localized</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm tracking-tight">{foundTxn.memberId?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{foundTxn.transactionId}</p>
                    </div>
                    <button
                      onClick={() => generateInvoice(foundTxn)}
                      className="w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center shadow-lg"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-soft">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'Cloud Sync', status: 'Operational', color: 'emerald' },
                { label: 'Database', status: 'Optimal', color: 'amber' },
                { label: 'PDF Engine', status: 'Active', color: 'indigo' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:border-violet-100">
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-2 h-2 rounded-full",
                      item.color === 'emerald' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' :
                        item.color === 'amber' ? 'bg-amber-500 shadow-lg shadow-amber-200' : 'bg-indigo-500 shadow-lg shadow-indigo-200'
                    )} />
                    <span className="text-sm font-bold text-slate-900">{item.label}</span>
                  </div>
                  <span className={clsx("text-[10px] font-black uppercase tracking-widest",
                    item.color === 'emerald' ? 'text-emerald-600' :
                      item.color === 'amber' ? 'text-amber-600' : 'text-indigo-600'
                  )}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
