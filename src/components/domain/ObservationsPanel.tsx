import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CircleHelp, ClipboardCheck, Eye, MessageSquareQuote, Plus } from 'lucide-react'
import {
  api,
  type ObservationKind,
  type ObservationResponse,
} from '../../api/client'
import { observationSchema, type ObservationValues } from '../../lib/validators'
import { useToast } from '../Toast'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Pagination,
  Skeleton,
  Textarea,
  type Tone,
} from '../ui'
import { apiErrorKey, useFormatters } from '../../lib/format'
import { cn } from '../../lib/utils'

const KINDS: ObservationKind[] = ['DIRECT', 'DECLARATION', 'UNVERIFIED']

const KIND_META: Record<
  ObservationKind,
  { tone: Tone; icon: typeof Eye; rowClass: string }
> = {
  DIRECT: {
    tone: 'brand',
    icon: Eye,
    rowClass: 'bg-brand-50/60 ring-1 ring-brand-100',
  },
  DECLARATION: {
    tone: 'gold',
    icon: MessageSquareQuote,
    rowClass: 'bg-gold-50/60 ring-1 ring-gold-200',
  },
  UNVERIFIED: {
    tone: 'neutral',
    icon: CircleHelp,
    rowClass: 'border border-dashed border-line bg-canvas/40',
  },
}

function draftKeyFor(missionId: string) {
  return `mofawid.obs.draft.${missionId}`
}

function loadDraft(missionId: string): ObservationValues | null {
  try {
    const raw = localStorage.getItem(draftKeyFor(missionId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { kind?: unknown; description?: unknown }
    if (
      typeof parsed.kind !== 'string' ||
      !KINDS.includes(parsed.kind as ObservationKind) ||
      typeof parsed.description !== 'string'
    ) {
      return null
    }
    return { kind: parsed.kind as ObservationKind, description: parsed.description }
  } catch {
    return null
  }
}

export function ObservationsPanel({
  missionId,
  canAdd,
}: {
  missionId: string
  canAdd: boolean
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [saveError, setSaveError] = useState(false)

  const form = useForm<ObservationValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: loadDraft(missionId) ?? { kind: 'DIRECT', description: '' },
  })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form

  const description = watch('description')
  const kind = watch('kind')

  /* Conserve le brouillon localement (terrain, batterie faible, coupure réseau). */
  useEffect(() => {
    if (!form.formState.isDirty || saveError) return
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKeyFor(missionId), JSON.stringify({ kind, description }))
      } catch {
        /* stockage indisponible */
      }
    }, 350)
    return () => window.clearTimeout(id)
  }, [form.formState.isDirty, missionId, kind, description, saveError])

  const listQ = useQuery({
    queryKey: ['observations', missionId, { page }],
    queryFn: () => api.observations.list(missionId, page, 20),
    enabled: Boolean(missionId),
  })

  const createM = useMutation({
    mutationFn: (values: ObservationValues) =>
      api.observations.create(missionId, {
        kind: values.kind,
        description: values.description.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', missionId] })
      toast(t('observations.created'))
      try {
        localStorage.removeItem(draftKeyFor(missionId))
      } catch {
        /* noop */
      }
      setSaveError(false)
      reset({ kind: 'DIRECT', description: '' })
      setPage(0)
    },
    onError: (error) => {
      setSaveError(true)
      toast(t(apiErrorKey(error)), 'error')
    },
  })

  const items = listQ.data?.content ?? []
  const count = listQ.data?.totalElements ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{t('observations.title')}</h2>
        <p className="text-sm text-ink-muted">{t('observations.count', { count })}</p>
      </div>

      {canAdd && (
        <Card className="p-5">
          <form
            className="space-y-4"
            onSubmit={handleSubmit((v) => createM.mutate(v))}
            noValidate
          >
            <fieldset>
              <legend className="text-sm font-medium text-ink">
                {t('observations.kind')}
                <span className="text-red-600" aria-hidden="true">
                  {' '}
                  *
                </span>
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {KINDS.map((item) => {
                  const selected = kind === item
                  const meta = KIND_META[item]
                  const Icon = meta.icon
                  return (
                    <button
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setValue('kind', item, { shouldValidate: true })}
                      className={cn(
                        'flex flex-col items-start gap-1.5 rounded-lg border p-3 text-start transition',
                        selected
                          ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                          : 'border-line bg-surface hover:border-brand-300',
                      )}
                    >
                      <span
                        className={cn(
                          'flex items-center gap-2 text-sm font-medium',
                          selected ? 'text-brand-800' : 'text-ink',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t(`observationKind.${item}`)}
                      </span>
                      <span className="text-xs leading-snug text-ink-muted">
                        {t(`observations.kindHints.${item}`)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <Field
              label={t('observations.description')}
              required
              error={errors.description ? t(errors.description.message as string) : undefined}
            >
              <Textarea
                id="observation-description"
                {...register('description')}
                rows={3}
                autoFocus={false}
                placeholder={t('observations.descriptionPlaceholder')}
              />
            </Field>

            {saveError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
              >
                {t('observations.addFailed')}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {form.formState.isDirty && (
                <span className="text-xs text-ink-muted">{t('observations.draftSaved')}</span>
              )}
              <Button
                type="submit"
                icon={<Plus className="h-4 w-4" />}
                loading={createM.isPending}
                className="ms-auto"
              >
                {t('observations.add')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!canAdd && <p className="text-sm text-ink-muted">{t('observations.onlyCollab')}</p>}

      <Card className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : listQ.isError ? (
          <EmptyState
            title={t('errors.loadFailed')}
            description={t('errors.network')}
            action={
              <Button variant="outline" onClick={() => listQ.refetch()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-6 w-6" />}
            title={t('observations.empty')}
            description={t('observations.emptyHint')}
          />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((observation) => (
              <ObservationRow key={observation.id} observation={observation} />
            ))}
          </ul>
        )}

        {!listQ.isLoading && !listQ.isError && (
          <Pagination
            page={page}
            totalPages={listQ.data?.totalPages ?? 0}
            onPageChange={setPage}
            previousLabel={t('common.previous')}
            nextLabel={t('common.next')}
            pageLabel={t('common.page')}
            ofLabel={t('common.of')}
          />
        )}
      </Card>
    </div>
  )
}

function ObservationRow({ observation }: { observation: ObservationResponse }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const meta = KIND_META[observation.kind] ?? KIND_META.DECLARATION
  const Icon = meta.icon

  return (
    <li className={cn('flex items-start gap-3.5 px-5 py-4', meta.rowClass)}>
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          observation.kind === 'DIRECT' && 'bg-brand-100 text-brand-700',
          observation.kind === 'DECLARATION' && 'bg-gold-100 text-gold-700',
          observation.kind === 'UNVERIFIED' && 'bg-slate-100 text-ink-muted',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={meta.tone}>{t(`observationKind.${observation.kind}`)}</Badge>
          {observation.kind === 'UNVERIFIED' && (
            <Badge tone="warning">{t('observations.toVerify')}</Badge>
          )}
          <span className="text-xs text-ink-muted tabnum">
            {fmt.dateTime(observation.observedAt)}
          </span>
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {observation.description}
        </p>
      </div>
    </li>
  )
}