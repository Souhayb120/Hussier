import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { api, type Role, type UserResponse } from '../api/client'
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
  type Tone,
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { UserFormDialog } from '../components/domain/UserFormDialog'
import { apiErrorKey, useFormatters } from '../lib/format'

const ROLE_TONES: Record<Role, Tone> = {
  SUPER_ADMIN: 'gold',
  ADMIN: 'gold',
  ASSISTANT: 'info',
  COLLABORATEUR: 'brand',
}

export default function UsersPage() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<UserResponse | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserResponse | null>(null)

  const query = useQuery({
    queryKey: ['users', { page }],
    queryFn: () => api.users.list(page, 10),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => api.users.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast(t('users.deleted'))
      setPendingDelete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const rows = useMemo(() => {
    const list = query.data?.content ?? []
    const term = search.trim().toLowerCase()
    if (!term) return list
    return list.filter((user) =>
      [user.username, user.email, user.nom, user.prenom]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    )
  }, [query.data, search])

  const isManageable = (user: UserResponse) =>
    user.role === 'ASSISTANT' || user.role === 'COLLABORATEUR'

  const fullName = (user: UserResponse) =>
    [user.prenom, user.nom].filter(Boolean).join(' ').trim() || '—'

  return (
    <div>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            {t('users.new')}
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
            icon={<Users className="h-6 w-6" />}
            title={t('users.empty')}
            description={t('users.emptyHint')}
            action={
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                {t('users.new')}
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Users className="h-6 w-6" />} title={t('common.search')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 text-start font-semibold">{t('users.username')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('users.email')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('users.role')}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t('users.status')}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((user) => (
                  <tr key={user.id} className="transition hover:bg-canvas/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={fullName(user)} />
                        <div>
                          <p className="font-medium text-ink">{user.username}</p>
                          <p className="text-xs text-ink-muted">
                            {fullName(user)} · {fmt.date(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={ROLE_TONES[user.role] ?? 'neutral'}>
                        {t(`roles.${user.role}`)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={user.active ? 'success' : 'neutral'}>
                        {user.active ? t('users.active') : t('users.inactive')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {isManageable(user) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t('common.edit')}
                              onClick={() => {
                                setEditing(user)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t('common.delete')}
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setPendingDelete(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isManageable(user) && (
                          <span className="text-xs text-ink-soft">{t('tenants.primaryAdmin')}</span>
                        )}
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

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} userItem={editing} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
        title={t('users.confirmDeleteTitle')}
        message={t('users.confirmDelete', { name: pendingDelete?.username ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}