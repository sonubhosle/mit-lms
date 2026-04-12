"use client"

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Database, 
  Save, 
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/lib/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    libraryName: 'City Central Library',
    libraryAddress: '',
    libraryPhone: '',
    finePerDay: 5,
    defaultBorrowDays: 14,
    autoBackupEnabled: true
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) setSettings(data)
      })
      .finally(() => setFetching(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 font-medium">Configure library rules, business hours, and fine structures</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="card p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <Building2 className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Library Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Library Name</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 outline-none"
                value={settings.libraryName}
                onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Phone</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 outline-none"
                value={settings.libraryPhone}
                onChange={(e) => setSettings({ ...settings, libraryPhone: e.target.value })}
              />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 outline-none"
                value={settings.libraryAddress}
                onChange={(e) => setSettings({ ...settings, libraryAddress: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="card p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <SettingsIcon className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Fines & Borrowing Rules</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fine Amount (per day)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 outline-none font-bold"
                  value={settings.finePerDay}
                  onChange={(e) => setSettings({ ...settings, finePerDay: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Default Borrow Duration (Days)</label>
              <input 
                type="number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 border border-slate-100 rounded-xl focus:ring-2 focus:-amber-500/20 outline-none font-bold"
                value={settings.defaultBorrowDays}
                onChange={(e) => setSettings({ ...settings, defaultBorrowDays: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </section>

        <section className="card p-8 opacity-60">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <Database className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Database & Backups</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Automatic Nightly Backups</p>
              <p className="text-xs text-slate-500">Backup created every day at 00:00 AM</p>
            </div>
            <div className="w-12 h-6 bg-amber-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white shadow-xl shadow-slate-200/50 rounded-full"></div>
            </div>
          </div>
          <button type="button" className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl font-bold text-slate-500 hover:-amber-500 transition-all">
            Trigger Manual Database Dump
          </button>
        </section>

        <div className="flex items-center justify-between fixed bottom-8 left-[292px] right-8 bg-white shadow-xl shadow-slate-200/50/80 backdrop-blur p-4 rounded-2xl shadow-2xl border border-slate-100 z-50">
          <p className="text-sm text-slate-500 px-4">Last updated: Today at 02:45 PM</p>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary min-w-[200px] py-3 shadow-lg shadow-amber-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span>Settings Saved</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={20} />
                  <span>Update Configuration</span>
                </div>
              )
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
