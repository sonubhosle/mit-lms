"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import clsx from 'clsx'

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select Option", 
  label, 
  searchable = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt => {
    const label = typeof opt === 'string' ? opt : opt.label
    return label.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const currentLabel = options.find(opt => {
    const val = typeof opt === 'string' ? opt : opt.value
    return val === value
  })
  
  const displayLabel = currentLabel 
    ? (typeof currentLabel === 'string' ? currentLabel : currentLabel.label)
    : placeholder

  return (
    <div className={clsx("space-y-2 relative", className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full px-4 py-3 bg-slate-50 border border-slate-100 border rounded-xl flex items-center justify-between transition-all duration-300 font-medium",
          isOpen ? "text-amber-500 ring-2 text-amber-500/10" : "border-slate-100"
        )}
      >
        <span className={clsx("truncate", !value && "text-gray-400")}>
          {displayLabel}
        </span>
        <ChevronDown 
          size={18} 
          className={clsx("text-slate-500 transition-transform duration-300", isOpen && "rotate-180 text-amber-500")} 
        />
      </button>

      {/* Dropdown Menu */}
      <div className={clsx(
        "absolute left-0 right-0 mt-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-300 origin-top",
        isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
      )}>
        {searchable && (
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 border border-slate-100 rounded-lg text-sm focus:outline-none focus:-amber-500 transition-colors"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div className="max-h-60 overflow-y-auto py-2 px-1 custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value
              const label = typeof opt === 'string' ? opt : opt.label
              const isSelected = val === value

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onChange(val);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={clsx(
                    "w-full px-4 py-2.5 text-left text-sm rounded-lg transition-all flex items-center justify-between group",
                    isSelected ? "text-amber-500/10 text-amber-500 font-bold" : "text-slate-500 hover:bg-slate-50 border border-slate-100 hover:-slate-900"
                  )}
                >
                  <span className="truncate">{label}</span>
                  {isSelected && <Check size={14} className="text-amber-500" />}
                </button>
              )
            })
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
