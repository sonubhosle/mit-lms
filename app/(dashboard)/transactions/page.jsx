"use client"

import { useState, useEffect } from 'react'
import IssueBookForm from '@/components/transactions/IssueBookForm'
import ReturnBookForm from '@/components/transactions/ReturnBookForm'
import TransactionTable from '@/components/transactions/TransactionTable'
import { PlusCircle, RotateCw, History, AlertTriangle } from 'lucide-react'
import { mutate } from 'swr'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const initialAction = searchParams.get('action') || 'history'
  const initialBookId = searchParams.get('bookId')
  
  const [activeTab, setActiveTab] = useState(initialAction)

  useEffect(() => {
    if (initialAction) setActiveTab(initialAction)
  }, [initialAction])

  const handleSuccess = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'))
  }

  const tabs = [
    { id: 'issue', label: 'Issue Book', icon: PlusCircle },
    { id: 'return', label: 'Return (via Search)', icon: RotateCw },
    { id: 'history', label: 'Current Issues & History', icon: History },
    { id: 'lost_collections', label: 'Lost Books', icon: AlertTriangle },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy">Library Transactions</h1>
          <p className="text-slate font-medium">Manage book circulation, returns, and inventory status</p>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-navy text-white shadow-soft" 
                : "text-slate hover:text-navy"
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'issue' && <IssueBookForm onSuccess={handleSuccess} initialBookId={initialBookId} />}
        {activeTab === 'return' && <ReturnBookForm onSuccess={handleSuccess} />}
        {activeTab === 'history' && <TransactionTable />}
        {activeTab === 'lost_collections' && <TransactionTable filter="lost" />}
      </div>
    </div>
  )
}
