import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const STYLES: Record<ToastType, string> = {
  success: 'text-brand-600',
  error: 'text-red-600',
  info: 'text-sky-600',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev, { id, message, type }])
      window.setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pe-6">
          {items.map((item) => {
            const Icon = ICONS[item.type]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => remove(item.id)}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm animate-slide-in-end items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-start shadow-pop',
                  'transition hover:bg-canvas',
                )}
              >
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', STYLES[item.type])} />
                <span className="text-sm text-ink">{item.message}</span>
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
