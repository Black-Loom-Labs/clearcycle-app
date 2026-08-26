"use client"

import * as React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastState {
  message: string
  id: number
}

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const showToast = React.useCallback((message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { message, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-[#E4E4EF] bg-white px-4 py-3 text-sm text-[#0A0A0F] shadow-lg',
              'animate-in slide-in-from-bottom-2 fade-in'
            )}
          >
            <CheckCircle2 className="size-4 shrink-0 text-[#16A34A]" />
            <span>{t.message}</span>
            <button
              className="ml-2 text-[#5C5C6B] hover:text-[#0A0A0F]"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
