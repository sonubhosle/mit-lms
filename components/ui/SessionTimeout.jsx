"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/useAuth'
import { AlertTriangle, Clock } from 'lucide-react'

const TIMEOUT_MINUTES = 1440 // 24 hours
const WARNING_MINUTES = 1438 // 23 hours 58 minutes

export default function SessionTimeout() {
  const { user, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  useEffect(() => {
    if (!user) return

    let timeoutTimer
    let warningTimer
    let countdownInterval

    const resetTimers = () => {
      clearTimeout(timeoutTimer)
      clearTimeout(warningTimer)
      clearInterval(countdownInterval)
      setShowWarning(false)
      setTimeLeft(120)

      warningTimer = setTimeout(() => {
        setShowWarning(true)
        countdownInterval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleLogout()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }, WARNING_MINUTES * 60 * 1000)

      timeoutTimer = setTimeout(handleLogout, TIMEOUT_MINUTES * 60 * 1000)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => window.addEventListener(event, resetTimers))

    resetTimers()

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimers))
      clearTimeout(timeoutTimer)
      clearTimeout(warningTimer)
      clearInterval(countdownInterval)
    }
  }, [user, handleLogout])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 text-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Session Expiring</h3>
          <p className="text-slate-500 mb-6">
            Your session is about to expire due to inactivity. You will be logged out in:
          </p>
          <div className="flex items-center gap-3 bg-red-50 px-6 py-4 rounded-xl text-red-500 font-bold text-3xl mb-8">
            <Clock size={28} />
            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={handleLogout}
              className="px-6 py-3 border border-slate-100 rounded-xl text-slate-500 font-bold hover:bg-slate-50 border border-slate-100 transition-colors"
            >
              Logout Now
            </button>
            <button
              onClick={() => {
                setShowWarning(false)
                // Activity will trigger the event listener to reset
                window.dispatchEvent(new Event('mousedown'))
              }}
              className="px-6 py-3 text-amber-500 text-slate-900 font-bold rounded-xl hover:-amber-600 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
