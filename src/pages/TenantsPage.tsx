import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Building2, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { api, type TenantResponse } from '../api/client'
import { useToast } from '../components/Toast'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Pagination,
  SearchInput,
  Skeleton,
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { TenantFormDialog } from '../components/domain/TenantFormDialog'
import { TenantAdminDialog } from '../components/domain/TenantAdminDialog'
import { apiErrorKey, useFormatters } from '../lib/format'

export default function TenantsPage() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TenantResponse | null>(null)
  const [adminTarget, setAdminTarget] = useState<TenantResponse | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TenantResponse | null>(null)

  const query = useQuery({
    queryKey: ['tenants', { page }],
    queryFn: () => api.tenants.list(page, 10),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => api.tenants.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast(t('tenants.deleted'))
      setPendingDelete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const rows = useMemo(() => {
    const list = query.data?.content ?? []
    const term = search.trim().toLowerCase()
    if (!term) return list
    return list.filter((tenant) =>
      [tenant.name, tenant.slug, tenant.adress]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    )
  }, [query.data, search])

  return (
    <div>
      <PageHeader
        icon={<Building2 className="h-5 w-5" />}
        title={t('tenants.title')}
        subtitle={t('tenants.subtitle')}
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            {t('tenants.new')}
          </Button>
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
            icon={<Building2 className="h-6 w-6" />}
            title={t('tenants.empty')}
            description={t('tenants.emptyHint')}
            action={
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                {t('tenants.new')}
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Building2 className="h-6 w-6" />} title={t('common.search')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 text-start font-semibold">{t('tenants.name')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('tenants.address')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('tenants.status')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('tenants.createdAt')}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((tenant) => (
                  <tr key={tenant.id} className="transition hover:bg-canvas/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={tenant.name} />
                        <div>
                          <p className="font-medium text-ink">{tenant.name}</p>
                          <p className="text-xs text-ink-muted">{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      {tenant.adress || '—'}
                      {tenant.phone ? ` · ${tenant.phone}` : ''}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={tenant.status === 'active' ? 'success' : 'neutral'}>
                        {tenant.status === 'active' ? t('tenants.active') : t('tenants.inactive')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{fmt.date(tenant.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('common.edit')}
                          onClick={() => {
                            setEditing(tenant)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          aria-label={t('tenants.createAdmin')}
                          title={t('tenants.createAdmin')}
                          icon={<ShieldCheck className="h-4 w-4" />}
                          onClick={() => setAdminTarget(tenant)}
                        >
                          {t('tenants.createAdmin')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('common.delete')}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setPendingDelete(tenant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <TenantFormDialog open={formOpen} onClose={() => setFormOpen(false)} tenant={editing} />

      <TenantAdminDialog
        open={adminTarget !== null}
        onClose={() => setAdminTarget(null)}
        tenant={adminTarget}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
        title={t('tenants.confirmDeleteTitle')}
        message={t('tenants.confirmDelete', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}