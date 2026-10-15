import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Eye, Play, Plus, SquareCheck } from 'lucide-react'
import { api, type MissionResponse, type MissionStatus } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/Toast'
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { MissionFormDialog } from '../components/domain/MissionFormDialog'
import { apiErrorKey, useFormatters } from '../lib/format'

const MISSION_STATUSES: MissionStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function MissionsPage() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const isAdmin = can('missions:view')

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | MissionStatus>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [pendingStart, setPendingStart] = useState<MissionResponse | null>(null)
  const [pendingComplete, setPendingComplete] = useState<MissionResponse | null>(null)

  const query = useQuery({
    queryKey: ['missions', isAdmin ? 'all' : 'mine', { page }],
    queryFn: () => (isAdmin ? api.missions.list(page, 10) : api.missions.listMine(page, 10)),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['missions'] })

  const startM = useMutation({
    mutationFn: (id: string) => api.missions.start(id),
    onSuccess: () => {
      invalidate()
      toast(t('missions.started'))
      setPendingStart(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const completeM = useMutation({
    mutationFn: (id: string) => api.missions.complete(id),
    onSuccess: () => {
      invalidate()
      toast(t('missions.completed'))
      setPendingComplete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const rows = useMemo(() => {
    const list = query.data?.content ?? []
    const term = search.trim().toLowerCase()
    return list.filter((mission) => {
      if (status !== 'ALL' && mission.status !== status) return false
      if (!term) return true
      return [mission.title, mission.caseRef, mission.assignedToUsername, mission.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    })
  }, [query.data, search, status])

  const busy = startM.isPending || completeM.isPending
  const emptyDescription = isAdmin ? t('missions.emptyHint') : t('missions.myEmpty')

  return (
    <div>
      <PageHeader
        icon={<ClipboardList className="h-5 w-5" />}
        title={isAdmin ? t('missions.title') : t('missions.myTitle')}
        subtitle={isAdmin ? t('missions.subtitle') : t('missions.mySubtitle')}
        actions={
          isAdmin ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
              {t('missions.new')}
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('common.search')}
            className="sm:max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ALL' | MissionStatus)}
            className="sm:max-w-[12rem]"
          >
            <option value="ALL">{t('common.all')}</option>
            {MISSION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`missionStatus.${value}`)}
              </option>
            ))}
          </Select>
          <span className="text-sm text-ink-muted sm:ms-auto">
            {query.data ? `${query.data.totalElements} ${t('common.results')}` : ''}
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {query.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <EmptyState
            title={t('errors.loadFailed')}
            description={t('errors.network')}
            action={
              <Button variant="outline" onClick={() => query.refetch()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : (query.data?.content ?? []).length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title={isAdmin ? t('missions.empty') : t('missions.myEmpty')}
            description={emptyDescription}
            action={
              isAdmin ? (
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                  {t('missions.new')}
                </Button>
              ) : undefined
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={<ClipboardList className="h-6 w-6" />} title={t('missions.noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 text-start font-semibold">{t('missions.missionTitle')}</th>
                  {isAdmin && (
                    <th className="px-5 py-3 text-start font-semibold">{t('missions.assignedTo')}</th>
                  )}
                  <th className="px-5 py-3 text-start font-semibold">{t('missions.status')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('missions.scheduledAt')}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((mission) => {
                  const canStart = !isAdmin && mission.status === 'ASSIGNED'
                  const canComplete = !isAdmin && mission.status === 'IN_PROGRESS'
                  return (
                    <tr
                      key={mission.id}
                      onClick={() => navigate(`/missions/${mission.id}`)}
                      className="cursor-pointer transition hover:bg-canvas/70"
                    >
                      <td className="max-w-[20rem] px-5 py-3.5">
                        <p className="truncate font-medium text-ink">{mission.title}</p>
                        <p className="truncate text-xs text-ink-muted">{mission.caseRef}</p>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={mission.assignedToUsername} className="h-8 w-8" />
                            <span className="text-ink-muted">{mission.assignedToUsername}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <StatusBadge value={mission.status} label={t(`missionStatus.${mission.status}`)} />
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted">
                        {fmt.dateTime(mission.scheduledAt ?? mission.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canStart && (
                            <Button
                              size="sm"
                              icon={<Play className="h-3.5 w-3.5" />}
                              disabled={busy}
                              onClick={() => setPendingStart(mission)}
                            >
                              {t('missions.start')}
                            </Button>
                          )}
                          {canComplete && (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={<SquareCheck className="h-3.5 w-3.5" />}
                              disabled={busy}
                              onClick={() => setPendingComplete(mission)}
                            >
                              {t('missions.complete')}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('common.view')}
                            onClick={() => navigate(`/missions/${mission.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!query.isLoading && !query.isError && (
          <Pagination
            page={page}
            totalPages={query.data?.totalPages ?? 0}
            onPageChange={setPage}
            previousLabel={t('common.previous')}
            nextLabel={t('common.next')}
            pageLabel={t('common.page')}
            ofLabel={t('common.of')}
          />
        )}
      </Card>

      <MissionFormDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={pendingStart !== null}
        onClose={() => setPendingStart(null)}
        onConfirm={() => pendingStart && startM.mutate(pendingStart.id)}
        title={t('missions.start')}
        message={t('missions.confirmStart')}
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
