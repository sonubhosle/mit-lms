"use client"

import { AuthProvider } from "@/lib/useAuth"

import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </AuthProvider>
  )
}
