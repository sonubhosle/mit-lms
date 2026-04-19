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
    <div className={`fixed inset-0 z-9999 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isVisible ? "opacity-100 bg-slate-900/40" : "opacity-0 bg-transparent"}  p-4 bg-slate-900/60 backdrop-blur-sm`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white transition-all duration-300 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"} shadow-xl shadow-slate-200/50 rounded-4xl w-full max-w-4xl overflow-hidden  max-h-[90vh] flex flex-col`}>
        <div className="bg-white p-6  flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 text-white bg-linear-to-r from-amber-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <PlusCircle size={25} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Issue New Book</h3>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-800 border border-slate-100 rounded-xl transition-colors">
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
