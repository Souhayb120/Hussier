import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Play,
  Plus,
  SquareCheck,
  UserRound,
} from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { ObservationsPanel } from '../components/domain/ObservationsPanel'
import { apiErrorKey, useFormatters } from '../lib/format'

export default function MissionDetailPage() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const isCollaborateur = can('missions:work')

  const [pendingStart, setPendingStart] = useState(false)
  const [pendingComplete, setPendingComplete] = useState(false)
  const obsRef = useRef<HTMLDivElement>(null)

  const focusObservation = () => {
    obsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const el = document.getElementById('observation-description')
    if (el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true })
  }

  const missionQ = useQuery({
    queryKey: ['mission', id],
    queryFn: () => api.missions.get(id),
    enabled: Boolean(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['mission', id] })
    queryClient.invalidateQueries({ queryKey: ['missions'] })
    queryClient.invalidateQueries({ queryKey: ['cases'] })
  }

  const startM = useMutation({
    mutationFn: () => api.missions.start(id),
    onSuccess: () => {
      invalidate()
      toast(t('missions.started'))
      setPendingStart(false)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const completeM = useMutation({
    mutationFn: () => api.missions.complete(id),
    onSuccess: () => {
      invalidate()
      toast(t('missions.completed'))
      setPendingComplete(false)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  if (missionQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (missionQ.isError || !missionQ.data) {
    return (
      <EmptyState
        title={t('missions.notFound')}
        action={
          <Button
            variant="outline"
            icon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}
            onClick={() => navigate(isCollaborateur ? '/mes-missions' : '/missions')}
          >
            {t('common.back')}
          </Button>
        }
      />
    )
  }

  const mission = missionQ.data
  const canStart = isCollaborateur && mission.status === 'ASSIGNED'
  const canComplete = isCollaborateur && mission.status === 'IN_PROGRESS'

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <Link
        to={isCollaborateur ? '/mes-missions' : '/missions'}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {isCollaborateur ? t('missions.myTitle') : t('missions.title')}
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={mission.status} label={t(`missionStatus.${mission.status}`)} />
              <Link
                to={`/dossiers/${mission.caseId}`}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 tabnum transition hover:bg-slate-200"
              >
                <ClipboardList className="h-3 w-3" />
                {mission.caseRef}
              </Link>
            </div>
            <h1 className="mt-2 text-22 font-bold tracking-tight text-ink sm:text-28">
              {mission.title}
            </h1>
            {mission.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {mission.description}
              </p>
            )}
          </div>

          {isCollaborateur && (
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              {canStart && (
                <Button icon={<Play className="h-4 w-4" />} onClick={() => setPendingStart(true)}>
                  {t('missions.start')}
                </Button>
              )}
              {canComplete && (
                <>
                  <Button icon={<Plus className="h-4 w-4" />} onClick={focusObservation}>
                    {t('observations.add')}
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<SquareCheck className="h-4 w-4" />}
                    onClick={() => setPendingComplete(true)}
                  >
                    {t('missions.complete')}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <UserRound className="mt-0.5 h-4 w-4 text-ink-soft" />
            <div>
              <dt className="text-2xs font-medium uppercase tracking-wide text-ink-soft">
                {t('missions.assignedTo')}
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{mission.assignedToUsername}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <UserRound className="mt-0.5 h-4 w-4 text-ink-soft" />
            <div>
              <dt className="text-2xs font-medium uppercase tracking-wide text-ink-soft">
                {t('missions.assignedBy')}
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{mission.assignedByUsername}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CalendarClock className="mt-0.5 h-4 w-4 text-ink-soft" />
            <div>
              <dt className="text-2xs font-medium uppercase tracking-wide text-ink-soft">
                {t('missions.scheduledAt')}
              </dt>
              <dd className="mt-0.5 text-sm text-ink">
                {fmt.dateTime(mission.scheduledAt ?? mission.createdAt)}
              </dd>
            </div>
          </div>
        </dl>
      </Card>

      <div
        id="observations"
        ref={obsRef}
        className="scroll-mt-24 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <ObservationsPanel missionId={mission.id} canAdd={isCollaborateur} />
      </div>

      {isCollaborateur && (canStart || canComplete) && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-2">
            {canStart && (
              <Button
                className="flex-1"
                icon={<Play className="h-4 w-4" />}
                onClick={() => setPendingStart(true)}
              >
                {t('missions.start')}
              </Button>
            )}
            {canComplete && (
              <>
                <Button
                  className="flex-1"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={focusObservation}
                >
                  {t('observations.add')}
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  icon={<SquareCheck className="h-4 w-4" />}
                  onClick={() => setPendingComplete(true)}
                >
                  {t('missions.complete')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingStart}
        onClose={() => setPendingStart(false)}
        onConfirm={() => startM.mutate()}
        title={t('missions.start')}
        message={t('missions.confirmStart')}
        confirmLabel={t('missions.start')}
        cancelLabel={t('common.cancel')}
        loading={startM.isPending}
        tone="primary"
      />
      <ConfirmDialog
        open={pendingComplete}
        onClose={() => setPendingComplete(false)}
        onConfirm={() => completeM.mutate()}
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