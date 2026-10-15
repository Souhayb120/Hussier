import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  ChevronDown,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  Users,
  X,
} from 'lucide-react'
import { cn, initials } from '../lib/utils'
import { useAuth } from '../auth/AuthProvider'
import type { Capability } from '../features/auth/permissions'
import type { Lang } from '../i18n'
import { LANG_KEY } from '../i18n'

type ShellVariant = 'cabinet' | 'platform'

/* --------------------------------- Logo ---------------------------------- */

function Logo({ compact }: { compact?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm ring-1 ring-white/15">
        <Scale className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-bold tracking-tight text-white">
            {t('app.name')}
          </span>
          <span className="block text-2xs text-white/50">{t('app.tagline')}</span>
        </span>
      )}
    </div>
  )
}

/* ------------------------------ Navigation ------------------------------- */

interface NavItem {
  to: string
  icon: typeof LayoutDashboard
  label: string
  cap: Capability
}

function useNavGroups(variant: ShellVariant) {
  const { t } = useTranslation()
  const { user, can } = useAuth()

  return useMemo(() => {
    if (!user) return []

    if (variant === 'platform') {
      const platformItems: NavItem[] = [
        { to: '/platform/offices', icon: Building2, label: t('nav.tenants'), cap: 'tenants:manage' },
      ]
      return [
        {
          title: t('nav.administration'),
          items: platformItems.filter((item) => can(item.cap)),
        },
      ].filter((group) => group.items.length > 0)
    }

    const all: NavItem[] = [
      { to: '/', icon: LayoutDashboard, label: t('nav.dashboard'), cap: 'dashboard:view' },
      { to: '/dossiers', icon: FolderOpen, label: t('nav.cases'), cap: 'cases:view' },
      {
        to: user.role === 'COLLABORATEUR' ? '/mes-missions' : '/missions',
        icon: ClipboardList,
        label: user.role === 'COLLABORATEUR' ? t('nav.myMissions') : t('nav.missions'),
        cap: user.role === 'COLLABORATEUR' ? 'missions:work' : 'missions:view',
      },
      { to: '/utilisateurs', icon: Users, label: t('nav.users'), cap: 'users:manage' },
    ]
    const allowed = all.filter((item) => can(item.cap))
    const workspace = allowed.filter((i) =>
      ['/', '/dossiers', '/missions', '/mes-missions'].includes(i.to),
    )
    const admin = allowed.filter((i) => ['/utilisateurs'].includes(i.to))
    return [
      { title: t('nav.workspace'), items: workspace },
      { title: t('nav.administration'), items: admin },
    ].filter((group) => group.items.length > 0)
  }, [t, user, can, variant])
}

function SidebarNav({
  variant,
  onNavigate,
}: {
  variant: ShellVariant
  onNavigate?: () => void
}) {
  const groups = useNavGroups(variant)
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4 scroll-thin">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-white/40">
            {group.title}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute inset-y-0 start-0 w-0.5 rounded-full bg-gold-400"
                      aria-hidden="true"
                    />
                  )}
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

/* ------------------------------ Brand panel ------------------------------ */

function Sidebar({
  variant,
  mobile,
  onClose,
}: {
  variant: ShellVariant
  mobile?: boolean
  onClose?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex h-full flex-col bg-brand-900',
        mobile ? 'w-72 max-w-[82vw] border-e border-white/10' : 'border-e border-white/10',
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <Logo />
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="h-px w-full bg-white/10" />
      <SidebarNav variant={variant} onNavigate={onClose} />
      <div className="border-t border-white/10 px-4 py-3">
        {variant === 'platform' && (
          <p className="pb-1 text-2xs text-white/40">{t('platform.header')}</p>
        )}
        <p className="text-center text-2xs text-white/40" dir="rtl" lang="ar">
          {t('app.short')}
        </p>
      </div>
    </div>
  )
}

/* ---------------------------- Language switcher -------------------------- */

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current: Lang = i18n.language.startsWith('ar') ? 'ar' : 'fr'
  const change = (lang: Lang) => {
    void i18n.changeLanguage(lang)
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* noop */
    }
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
      {(['fr', 'ar'] as Lang[]).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => change(lang)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
            current === lang ? 'bg-brand-600 text-white' : 'text-ink-muted hover:text-ink',
          )}
        >
          {lang === 'fr' ? 'FR' : 'ع'}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------- User menu ------------------------------- */

function UserMenu() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!user) return null

  const displayName = user.username

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface py-1 ps-1 pe-2.5 transition hover:border-brand-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-xs font-semibold text-white">
          {initials(displayName)}
        </span>
        <span className="hidden text-start sm:block">
          <span className="block text-sm font-medium leading-tight text-ink">{displayName}</span>
          <span className="block text-2xs leading-tight text-ink-muted">
            {t(`roles.${user.role}`)}
          </span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-ink-soft transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-56 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">{displayName}</p>
            <p className="text-2xs text-ink-muted">{t(`roles.${user.role}`)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              logout()
              navigate('/login', { replace: true })
            }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

/* --------------------------------- Shell --------------------------------- */

function Shell({ variant, children }: { variant: ShellVariant; children: ReactNode }) {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-brand-800 focus:px-3 focus:py-2 focus:text-sm focus:text-white focus:shadow-pop"
      >
        {t('nav.skipToContent')}
      </a>

      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 lg:block">
        <Sidebar variant={variant} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-slate-900/45 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 animate-slide-in-end rtl:animate-none">
            <Sidebar variant={variant} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-ink-muted hover:bg-canvas hover:text-ink lg:hidden"
              aria-label={t('nav.menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden flex-1 items-center lg:flex" />
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return <Shell variant="cabinet">{children}</Shell>
}

/** Coquille dédiée à l'administration de la plateforme (SUPER_ADMIN). */
export function PlatformShell({ children }: { children: ReactNode }) {
  return <Shell variant="platform">{children}</Shell>
}

/* ------------------------------ Page header ------------------------------ */

export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex">
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-22 font-bold tracking-tight text-ink sm:text-28">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-5 h-px w-full bg-gold-400/35" aria-hidden="true" />
    </div>
  )
}