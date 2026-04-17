"use client"

import { useState, useEffect } from 'react'
import IssueBookForm from '@/components/transactions/IssueBookForm'
import ReturnBookForm from '@/components/transactions/ReturnBookForm'
import TransactionTable from '@/components/transactions/TransactionTable'
import { PlusCircle, RotateCw, History, AlertTriangle } from 'lucide-react'
import { mutate } from 'swr'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'

import IssueModal from '@/components/transactions/IssueModal'

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const initialAction = searchParams.get('action') || 'history'

  const [activeTab, setActiveTab] = useState(initialAction === 'issue' ? 'history' : initialAction)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(initialAction === 'issue')

  const handleSuccess = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'))
  }

  const tabs = [
    { id: 'history', label: 'History & Returns', icon: History },
    { id: 'return', label: 'Search & Collect', icon: RotateCw },
    { id: 'lost_collections', label: 'Lost Books', icon: AlertTriangle },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Library Transactions</h1>
          <p className="text-slate-500 font-medium">Manage book circulation, returns, and inventory status</p>
        </div>
        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-violet-500 to-violet-700 text-white rounded-2xl px-5 py-3 hover:from-violet-700 hover:to-violet-500 transition ease-in duration-300 hover:shadow-2xl"
        >
          <PlusCircle size={24} strokeWidth={2.5} />
          <span className="text-lg">Issue New Book</span>
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-slate-900 text-slate-900 shadow-soft"
                : "text-slate-500 hover:-slate-900"
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'return' && <ReturnBookForm onSuccess={handleSuccess} />}
        {activeTab === 'history' && <TransactionTable />}
        {activeTab === 'lost_collections' && <TransactionTable filter="lost" />}
      </div>

      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
