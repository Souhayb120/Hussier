import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  FolderOpen,
  Play,
  Plus,
  SquareCheck,
} from 'lucide-react'
import { api, type MissionResponse } from '../api/client'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { apiErrorKey, useFormatters } from '../lib/format'
import { cn } from '../lib/utils'

type Segment = 'today' | 'upcoming' | 'completed'

export default function MesMissionsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [segment, setSegment] = useState<Segment>('today')
  const [pendingStart, setPendingStart] = useState<MissionResponse | null>(null)
  const [pendingComplete, setPendingComplete] = useState<MissionResponse | null>(null)

  const listQ = useQuery({
    queryKey: ['missions', 'mine'],
    queryFn: () => api.missions.listMine(0, 200),
  })

  const invalidate = (id: string) => {
    queryClient.invalidateQueries({ queryKey: ['missions'] })
    queryClient.invalidateQueries({ queryKey: ['mission', id] })
  }

  const startM = useMutation({
    mutationFn: (id: string) => api.missions.start(id),
    onSuccess: (mission) => {
      invalidate(mission.id)
      toast(t('missions.started'))
      setPendingStart(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const completeM = useMutation({
    mutationFn: (id: string) => api.missions.complete(id),
    onSuccess: (mission) => {
      invalidate(mission.id)
      toast(t('missions.completed'))
      setPendingComplete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const rows = listQ.data?.content ?? []

  const buckets = useMemo(() => {
    const todayKey = new Date().toDateString()
    const result: Record<Segment, MissionResponse[]> = { today: [], upcoming: [], completed: [] }
    for (const mission of rows) {
      if (mission.status === 'IN_PROGRESS') {
        result.today.push(mission)
      } else if (mission.status === 'ASSIGNED') {
        const scheduled = mission.scheduledAt ? new Date(mission.scheduledAt) : null
        const isToday = !!scheduled && scheduled.toDateString() === todayKey
        result[isToday ? 'today' : 'upcoming'].push(mission)
      } else {
        result.completed.push(mission)
      }
    }
    return result
  }, [rows])

  const segments: Array<{ key: Segment; label: string }> = [
    { key: 'today', label: t('missions.segmentToday') },
    { key: 'upcoming', label: t('missions.segmentUpcoming') },
    { key: 'completed', label: t('missions.segmentCompleted') },
  ]

  const openMission = (id: string) => navigate(`/missions/${id}`)

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('missions.myTitle')}
        subtitle={t('missions.mySubtitle')}
        icon={<ClipboardList className="h-5 w-5" />}
      />

      {!listQ.isLoading && !listQ.isError && rows.length > 0 && (
        <div
          role="group"
          aria-label={t('nav.myMissions')}
          className="flex gap-1 rounded-lg border border-line bg-surface p-1"
        >
          {segments.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={segment === item.key}
              onClick={() => setSegment(item.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                segment === item.key
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-muted hover:bg-canvas hover:text-ink',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabnum',
                  segment === item.key ? 'bg-white/20 text-white' : 'bg-canvas text-ink-soft',
                )}
              >
                {buckets[item.key].length}
              </span>
            </button>
          ))}
        </div>
      )}

      {listQ.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : listQ.isError ? (
        <Card>
          <EmptyState
            title={t('errors.loadFailed')}
            description={t('errors.network')}
            action={
              <Button variant="outline" onClick={() => listQ.refetch()}>
                {t('common.retry')}
              </Button>
            }
          />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarCheck className="h-6 w-6" />}
            title={t('missions.myEmpty')}
            description={t('missions.mySubtitle')}
          />
        </Card>
      ) : buckets[segment].length === 0 ? (
        <Card>
          <EmptyState
            icon={
              segment === 'today' ? (
                <CalendarClock className="h-6 w-6" />
              ) : (
                <ClipboardList className="h-6 w-6" />
              )
            }
            title={t(
              segment === 'today'
                ? 'missions.emptyToday'
                : segment === 'upcoming'
                  ? 'missions.emptyUpcoming'
                  : 'missions.emptyCompleted',
            )}
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {buckets[segment].map((mission) => (
            <li key={mission.id}>
              <MissionCard
                mission={mission}
                onOpen={() => openMission(mission.id)}
                onOpenCase={() => navigate(`/dossiers/${mission.caseId}`)}
                onStart={() => setPendingStart(mission)}
                onComplete={() => setPendingComplete(mission)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingStart !== null}
        onClose={() => setPendingStart(null)}
        onConfirm={() => pendingStart && startM.mutate(pendingStart.id)}
        title={t('missions.start')}
        message={
          pendingStart
            ? t('missions.confirmStart')
            : ''
        }
        confirmLabel={t('missions.start')}
        cancelLabel={t('common.cancel')}
        loading={startM.isPending}
        tone="primary"
      />
      <ConfirmDialog
        open={pendingComplete !== null}
        onClose={() => setPendingComplete(null)}
        onConfirm={() => pendingComplete && completeM.mutate(pendingComplete.id)}
        title={t('missions.complete')}
        message={t('missions.confirmComplete')}
        confirmLabel={t('missions.complete')}
        cancelLabel={t('common.cancel')}
        loading={completeM.isPending}
        tone="primary"
      />
    </div>
  )
}

function MissionCard({
  mission,
  onOpen,
  onOpenCase,
  onStart,
  onComplete,
}: {
  mission: MissionResponse
  onOpen: () => void
  onOpenCase: () => void
  onStart: () => void
  onComplete: () => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const done = mission.status === 'COMPLETED' || mission.status === 'CANCELLED'
  const inProgress = mission.status === 'IN_PROGRESS'

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 text-start">
          <h3 className="truncate font-semibold text-ink transition hover:text-brand-700">
            {mission.title}
          </h3>
        </button>
        <StatusBadge value={mission.status} label={t(`missionStatus.${mission.status}`)} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenCase}
          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabnum transition hover:bg-slate-200"
        >
          <FolderOpen className="h-3 w-3" />
          {mission.caseRef}
        </button>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted tabnum">
          <CalendarClock className="h-3.5 w-3.5" />
          {mission.scheduledAt ? fmt.dateTime(mission.scheduledAt) : t('missions.unplanned')}
        </span>
      </div>

      {mission.description && (
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {mission.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {mission.status === 'ASSIGNED' && (
          <Button size="sm" icon={<Play className="h-4 w-4" />} onClick={onStart}>
            {t('missions.start')}
          </Button>
        )}
        {inProgress && (
          <>
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={onOpen}>
              {t('observations.add')}
            </Button>
            <Button size="sm" variant="outline" icon={<SquareCheck className="h-4 w-4" />} onClick={onComplete}>
              {t('missions.complete')}
            </Button>
          </>
        )}
        {done && (
          <Button size="sm" variant="ghost" onClick={onOpen}>
            {t('common.view')}
          </Button>
        )}
      </div>
    </Card>
  )
}