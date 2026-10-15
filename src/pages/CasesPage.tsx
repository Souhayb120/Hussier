import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Eye, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  api,
  type CaseResponse,
  type CaseStatus,
} from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/Toast'
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  DeadlineIndicator,
  EmptyState,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { CaseFormDialog } from '../components/domain/CaseFormDialog'
import { apiErrorKey } from '../lib/format'

const CASE_STATUSES: CaseStatus[] = [
  'QUALIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'AWAITING_APPROVAL',
  'CLOSED',
]

export default function CasesPage() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const canDelete = can('cases:delete')

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | CaseStatus>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CaseResponse | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CaseResponse | null>(null)

  const query = useQuery({
    queryKey: ['cases', { page }],
    queryFn: () => api.cases.list(page, 10),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => api.cases.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast(t('cases.deleted'))
      setPendingDelete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const rows = useMemo(() => {
    const list = query.data?.content ?? []
    const term = search.trim().toLowerCase()
    return list.filter((item) => {
      if (status !== 'ALL' && item.caseStatus !== status) return false
      if (!term) return true
      return [item.ref, item.clientName, item.clientIce, item.subject, item.address]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    })
  }, [query.data, search, status])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (item: CaseResponse) => {
    setEditing(item)
    setFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        icon={<FolderOpen className="h-5 w-5" />}
        title={t('cases.title')}
        subtitle={t('cases.subtitle')}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            {t('cases.new')}
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('cases.searchPlaceholder')}
            className="sm:max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ALL' | CaseStatus)}
            className="sm:max-w-[12rem]"
          >
            <option value="ALL">{t('common.all')}</option>
            {CASE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`caseStatus.${value}`)}
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
            icon={<FolderOpen className="h-6 w-6" />}
            title={t('cases.empty')}
            description={t('cases.emptyHint')}
            action={
              <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                {t('cases.new')}
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={<FolderOpen className="h-6 w-6" />} title={t('cases.noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-start text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 text-start font-semibold">{t('cases.client')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('cases.subject')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('cases.status')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('cases.deadline')}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/dossiers/${item.id}`)}
                      className="cursor-pointer transition hover:bg-canvas/70"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={item.clientName} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{item.clientName}</p>
                            <p className="truncate text-xs text-ink-muted">{item.ref}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[16rem] px-5 py-3.5">
                        <p className="truncate text-ink-muted">{item.subject}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          value={item.caseStatus}
                          label={t(`caseStatus.${item.caseStatus}`)}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <DeadlineIndicator
                          deadline={item.deadline}
                          closed={item.caseStatus === 'CLOSED'}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('common.view')}
                            onClick={() => navigate(`/dossiers/${item.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('common.edit')}
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t('common.delete')}
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setPendingDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

      <CaseFormDialog open={formOpen} onClose={() => setFormOpen(false)} caseItem={editing} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
        title={t('cases.confirmDeleteTitle')}
        message={t('cases.confirmDelete', { ref: pendingDelete?.ref ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}
