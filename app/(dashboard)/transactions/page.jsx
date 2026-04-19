"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import IssueBookForm from '@/components/transactions/IssueBookForm'
import ReturnBookForm from '@/components/transactions/ReturnBookForm'
import TransactionTable from '@/components/transactions/TransactionTable'
import { PlusCircle, RotateCcw, History, AlertTriangle, BookOpen } from 'lucide-react'
import { mutate } from 'swr'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'

import IssueModal from '@/components/transactions/IssueModal'

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const initialAction = searchParams.get('action') || 'history'

  const [activeTab, setActiveTab] = useState(initialAction === 'issue' || initialAction === 'history' ? 'issued' : initialAction)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(initialAction === 'issue')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef([])

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]
    
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth
      })
    }
  }, [activeTab])

  const handleSuccess = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'))
  }

  const tabs = [
    { id: 'issued', label: 'Issued Books', icon: BookOpen },
    { id: 'return', label: 'Return Books', icon: RotateCcw },
    { id: 'lost', label: 'Lost Books', icon: AlertTriangle },
    { id: 'history', label: 'Book History', icon: History },
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

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit relative overflow-hidden ring-1 ring-slate-200 shadow-inner">
        {/* Sliding Indicator */}
        <div 
          className="absolute h-[calc(100%-8px)] top-1 bg-slate-900 rounded-xl transition-all duration-300 ease-out shadow-lg"
          style={{ 
            left: indicatorStyle.left, 
            width: indicatorStyle.width 
          }}
        />

        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            ref={el => tabsRef.current[idx] = el}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "text-white"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-fade-in space-y-4">
        {activeTab === 'issued' && <TransactionTable filter="issued,overdue" />}
        {activeTab === 'return' && <TransactionTable filter="returned" title="Returns Log" subtitle="History of books that have been successfully returned" />}
        {activeTab === 'lost' && <TransactionTable filter="lost" />}
        {activeTab === 'history' && <TransactionTable />}
      </div>

      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
