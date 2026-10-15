import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  History,
  Inbox,
  ListChecks,
} from 'lucide-react'
import { api, type CaseResponse } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import {
  Card,
  DeadlineIndicator,
  EmptyState,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { GeometricPattern } from '../components/GeometricPattern'
import { useFormatters } from '../lib/format'
import { cn } from '../lib/utils'

/** Clé « yyyy-MM-dd » du jour (comparable directement aux échéances reçues). */
function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, can } = useAuth()
  const fmt = useFormatters()
  const canSeeMissions = can('missions:view')

  const casesQ = useQuery({
    queryKey: ['cases', { page: 0, size: 200 }],
    queryFn: () => api.cases.list(0, 200),
  })
  const missionsQ = useQuery({
    queryKey: ['missions', { page: 0, size: 200 }],
    queryFn: () => api.missions.list(0, 200),
    enabled: canSeeMissions,
  })

  const cases = casesQ.data?.content ?? []
  const missions = missionsQ.data?.content ?? []

  const stats = useMemo(() => {
    const tKey = todayKey()
    return {
      open: cases.filter((c) => c.caseStatus !== 'CLOSED').length,
      awaiting: cases.filter((c) => c.caseStatus === 'AWAITING_APPROVAL').length,
      dueToday: cases.filter(
        (c) => c.caseStatus !== 'CLOSED' && !!c.deadline && c.deadline === tKey,
      ).length,
      overdue: cases.filter(
        (c) => c.caseStatus !== 'CLOSED' && !!c.deadline && c.deadline < tKey,
      ).length,
      inProgress: missions.filter((m) => m.status === 'IN_PROGRESS').length,
    }
  }, [cases, missions])

  /** File « À traiter aujourd'hui » : à valider, en retard ou échéance du jour. */
  const queue = useMemo(() => {
    const tKey = todayKey()
    const rank = (c: CaseResponse): number => {
      if (c.caseStatus === 'AWAITING_APPROVAL') return 0
      if (!!c.deadline && c.deadline < tKey) return 1
      return 2
    }
    return cases
      .filter(
        (c) =>
          c.caseStatus === 'AWAITING_APPROVAL' ||
          (c.caseStatus !== 'CLOSED' && !!c.deadline && c.deadline <= tKey),
      )
      .sort((a, b) => rank(a) - rank(b) || a.ref.localeCompare(b.ref))
  }, [cases])

  const recent = useMemo(() => {
    type Activity = { id: string; at: string; title: string; detail: string; href: string }
    const caseItems: Activity[] = cases.map((c) => ({
      id: c.id,
      at: c.createdAt,
      title: c.clientName,
      detail: c.ref,
      href: `/dossiers/${c.id}`,
    }))
    const missionItems: Activity[] = missions.map((m) => ({
      id: m.id,
      at: m.createdAt,
      title: m.title,
      detail: m.caseRef,
      href: `/missions/${m.id}`,
    }))
    return [...caseItems, ...missionItems]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 7)
  }, [cases, missions])

  return (
    <div className="space-y-5">
      {/* Bandeau d'accueil */}
      <section className="relative overflow-hidden rounded-xl bg-brand-900 px-6 py-7 text-white sm:px-8 sm:py-8">
        <GeometricPattern className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.04]" />
        <div className="relative">
          <p className="text-2xs font-semibold uppercase tracking-wider text-white/60">
            {t('dashboard.title')}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {t('dashboard.greeting', { name: user?.username ?? '' })}
          </h1>
          <p className="mt-0.5 text-sm text-gold-300 tabnum">
            {fmt.dateLong(new Date().toISOString())}
          </p>
          <p className="mt-2 max-w-xl text-sm text-white/75">{t('dashboard.subtitle')}</p>
        </div>
      </section>

      {/* Bande de synthèse cliquable */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<FolderOpen className="h-5 w-5" />}
          label={t('dashboard.summaryCases')}
          value={stats.open}
          to="/dossiers"
          loading={casesQ.isLoading}
        />
        <SummaryCard
          icon={<Inbox className="h-5 w-5" />}
          label={t('dashboard.summaryToValidate')}
          value={stats.awaiting}
          to="/dossiers"
          loading={casesQ.isLoading}
          accent={stats.awaiting > 0 ? 'gold' : undefined}
        />
        <SummaryCard
          icon={<CalendarClock className="h-5 w-5" />}
          label={t('dashboard.summaryOverdue')}
          value={stats.overdue}
          to="/dossiers"
          loading={casesQ.isLoading}
          accent={stats.overdue > 0 ? 'danger' : undefined}
        />
        {canSeeMissions && (
          <SummaryCard
            icon={<ClipboardList className="h-5 w-5" />}
            label={t('dashboard.summaryMissions')}
            value={stats.inProgress}
            to="/missions"
            loading={missionsQ.isLoading}
          />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* À traiter aujourd'hui */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ListChecks className="h-4 w-4 text-brand-600" />
              {t('dashboard.toDo')}
            </h2>
            {!casesQ.isLoading && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 tabnum">
                {queue.length}
              </span>
            )}
          </div>

          {casesQ.isLoading ? (
            <ListSkeleton />
          ) : queue.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                icon={<CheckCircle2 className="h-6 w-6" />}
                title={t('dashboard.toDoEmpty')}
                description={t('dashboard.toDoEmptyHint')}
              />
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {queue.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/dossiers/${c.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-canvas"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{c.clientName}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-muted">
                          <span className="tabnum">{c.ref}</span> · {c.subject}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <StatusBadge
                          value={c.caseStatus}
                          label={t(`caseStatus.${c.caseStatus}`)}
                        />
                        <DeadlineIndicator
                          deadline={c.deadline}
                          closed={c.caseStatus === 'CLOSED'}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-5 py-3">
                <Link
                  to="/dossiers"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 transition hover:text-brand-800"
                >
                  {t('dashboard.viewAll')}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </>
          )}
        </Card>

        {/* Activité récente */}
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <History className="h-4 w-4 text-gold-600" />
              {t('dashboard.activity')}
            </h2>
          </div>
          {casesQ.isLoading || missionsQ.isLoading ? (
            <ListSkeleton />
          ) : recent.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                icon={<CalendarCheck className="h-6 w-6" />}
                title={t('dashboard.activityEmpty')}
              />
            </div>
          ) : (
            <ul className="px-5 py-2">
              {recent.map((item, index) => (
                <li key={`${item.id}`}>
                  <Link
                    to={item.href}
                    className="flex gap-3 rounded-lg px-2 py-3 transition hover:bg-canvas"
                  >
                    <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
                      {index < recent.length - 1 && (
                        <span
                          className="absolute top-4 start-1/2 h-[calc(100%-0.25rem)] w-px -translate-x-1/2 bg-line"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          item.href.startsWith('/dossiers') ? 'bg-brand-500' : 'bg-gold-500',
                        )}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                      <span className="block truncate text-xs text-ink-muted tabnum">
                        {fmt.dateTime(item.at)} · {item.detail}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  to,
  loading,
  accent,
}: {
  icon: ReactNode
  label: string
  value: number
  to: string
  loading?: boolean
  accent?: 'gold' | 'danger'
}) {
  const active = accent && value > 0
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 shadow-card transition hover:border-brand-300 hover:shadow-pop"
    >
      <div className="min-w-0">
        <p className="text-2xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
        {loading ? (
          <Skeleton className="mt-1.5 h-7 w-12" />
        ) : (
          <p
            className={cn(
              'mt-0.5 text-2xl font-bold tracking-tight tabnum',
              accent === 'gold' && value > 0
                ? 'text-gold-700'
                : accent === 'danger' && value > 0
                  ? 'text-red-600'
                  : 'text-ink',
            )}
          >
            {value}
          </p>
        )}
      </div>
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
          !active && 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white',
          accent === 'gold' && value > 0 &&
            'bg-gold-50 text-gold-700 group-hover:bg-gold-600 group-hover:text-white',
          accent === 'danger' && value > 0 &&
            'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white',
        )}
      >
        {icon}
      </span>
    </Link>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3 px-5 py-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}