"use client"

import { X, PlusCircle } from 'lucide-react'
import IssueBookForm from './IssueBookForm'
import { useState, useEffect } from 'react';

export default function IssueModal({ isOpen, onClose, onSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isRendered) return null;


  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden  max-h-[90vh] flex flex-col`}>
        <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center bg-slate-900 shadow-lg shadow-amber-500/20">
              <PlusCircle size={20} />
            </div>
            <h3 className="text-xl font-bold">Issue New Book</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white shadow-xl shadow-slate-200/50/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <IssueBookForm
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  )
}
