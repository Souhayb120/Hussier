/* =============================================================================
 * ui.tsx — Bibliothèque de composants d'interface réutilisables.
 * ========================================================================== */

import {
  forwardRef,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CalendarClock, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '../lib/format'
import { cn, initials } from '../lib/utils'

/* --------------------------------- Button -------------------------------- */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 disabled:opacity-60',
  outline:
    'border border-line bg-surface text-ink hover:border-brand-300 hover:bg-brand-50/60 disabled:opacity-60',
  ghost: 'text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-md px-3 text-sm',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-11 gap-2 rounded-lg px-5 text-[0.95rem]',
  icon: 'h-9 w-9 rounded-md',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/45 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
    </button>
  )
})

/* --------------------------------- Spinner ------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className ?? 'h-5 w-5')}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

/* ------------------------------- Form fields ----------------------------- */

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="ms-1 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="error-text">{error}</span>
      ) : hint ? (
        <span className="hint">{hint}</span>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn('input', className)} {...rest} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return <textarea ref={ref} rows={rows} className={cn('input resize-y', className)} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn('input cursor-pointer pe-9', className)} {...rest}>
        {children}
      </select>
    )
  },
)

/* ---------------------------------- Card --------------------------------- */

export function Card({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...rest}>
      {children}
    </div>
  )
}

/* --------------------------------- Badge --------------------------------- */

export type Tone =
  | 'neutral'
  | 'brand'
  | 'info'
  | 'warning'
  | 'danger'
  | 'success'
  | 'gold'

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  warning: 'bg-gold-100 text-gold-700 ring-gold-300',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  gold: 'bg-gold-50 text-gold-700 ring-gold-300',
}

/** Associe un statut du back-end à une couleur (dictionnaire centralisé). */
const STATUS_TONES: Record<string, Tone> = {
  // Dossiers
  QUALIFIED: 'neutral',
  ASSIGNED: 'info',
  IN_PROGRESS: 'success',
  AWAITING_APPROVAL: 'gold',
  CLOSED: 'neutral',
  // Missions
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  // Documents
  DRAFT: 'neutral',
  DRAFT_AI: 'brand',
  APPROVED: 'success',
  // Observations
  DIRECT: 'brand',
  DECLARATION: 'gold',
  UNVERIFIED: 'neutral',
  // Facturation
  UNPAID: 'danger',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ value, label }: { value: string; label: string }) {
  return <Badge tone={STATUS_TONES[value] ?? 'neutral'}>{label}</Badge>
}

/**
 * Indicateur d'échéance : date absolue + état (en retard / aujourd'hui / proche),
 * jamais exprimé par la couleur seule.
 */
export function DeadlineIndicator({
  deadline,
  closed,
}: {
  deadline?: string | null
  closed?: boolean
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()

  if (!deadline) return <span className="text-sm text-ink-soft">—</span>

  const d = new Date(deadline.slice(0, 10) + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Number.isNaN(d.getTime())
    ? 0
    : Math.round((d.getTime() - today.getTime()) / 86_400_000)

  const late = !closed && days < 0
  const due = days === 0
  const near = !closed && !late && days > 0 && days <= 7

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-1 text-sm tabnum',
          late
            ? 'font-medium text-red-600'
            : due || near
              ? 'font-medium text-gold-700'
              : 'text-ink-muted',
        )}
      >
        <CalendarClock className="h-3.5 w-3.5" />
        {fmt.date(deadline)}
      </span>
      {late && <Badge tone="danger">{t('deadline.late')}</Badge>}
      {!late && due && <Badge tone="warning">{t('deadline.today')}</Badge>}
      {!late && !due && near && (
        <Badge tone="warning">{t('deadline.soon', { count: days })}</Badge>
      )}
      {closed && <Badge tone="neutral">{t('deadline.closed')}</Badge>}
    </span>
  )
}

/* --------------------------------- Avatar -------------------------------- */

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white',
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

/* --------------------------------- Tabs ---------------------------------- */

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-line', className)}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              active
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-muted hover:border-line hover:text-ink',
            )}
          >
            {item.icon}
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-2xs',
                  active ? 'bg-brand-100 text-brand-700' : 'bg-canvas text-ink-muted',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* --------------------------------- Dialog -------------------------------- */

const DIALOG_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: keyof typeof DIALOG_SIZES
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative z-10 max-h-[92vh] w-full animate-scale-in overflow-hidden rounded-t-2xl bg-surface shadow-pop sm:rounded-xl',
          DIALOG_SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-me-1 -mt-1 rounded-lg p-1.5 text-ink-soft transition hover:bg-canvas hover:text-ink"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scroll-thin max-h-[64vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

/* ----------------------------- Confirm dialog ---------------------------- */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading,
  tone = 'danger',
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
  tone?: 'danger' | 'primary'
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600',
          )}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="pt-1.5 text-sm text-ink-muted">{message}</p>
      </div>
    </Dialog>
  )
}

/* ------------------------------- Empty state ----------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
      )}
      <div>
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* -------------------------------- Skeleton ------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-line/70', className)} />
}

/* ------------------------------- Pagination ------------------------------ */

export function Pagination({
  page,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
  pageLabel,
  ofLabel,
  disabled,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  previousLabel: string
  nextLabel: string
  pageLabel: string
  ofLabel: string
  disabled?: boolean
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 0}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        {previousLabel}
      </button>
      <span className="text-sm text-ink-muted">
        {pageLabel} <span className="font-semibold text-ink">{page + 1}</span> {ofLabel}{' '}
        {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages - 1}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </div>
  )
}

/* ------------------------------ Search input ----------------------------- */

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input ps-9"
        type="search"
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-soft"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}
