import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { DoorClosed, MapPinned, Plus } from 'lucide-react'
import {
  api,
  DELIVERY_RESULTS,
  type DeliveryAttemptResponse,
  type DeliveryResult,
} from '../../api/client'
import { attemptSchema, type AttemptValues } from '../../lib/validators'
import { apiErrorKey, useFormatters } from '../../lib/format'
import { useToast } from '../Toast'
import { Badge, Button, Card, EmptyState, Field, Input, Select, Skeleton, Textarea, type Tone } from '../ui'

/* =============================================================================
 * DeliveryAttemptsPanel — visites de notification d'une mission.
 * Chaque passage à l'adresse est enregistré : le PV de refus reprend toutes
 * les visites, et le résultat de la dernière visite fixe le type de PV
 * (تبليغ / اخباري / رفض التوصل).
 * ========================================================================== */

const EMPTY: AttemptValues = {
  attemptedAt: '',
  result: 'DELIVERED_IN_PERSON',
  receiverName: '',
  receiverCin: '',
  receiverCapacity: '',
  signed: false,
  visitCardLeft: false,
  notes: '',
}

const RESULT_TONE: Record<DeliveryResult, Tone> = {
  DELIVERED_IN_PERSON: 'brand',
  DELIVERED_TO_OTHER: 'brand',
  REFUSED: 'warning',
  NOBODY_THERE: 'neutral',
  ADDRESS_INCOMPLETE: 'neutral',
  ADDRESS_NOT_FOUND: 'neutral',
  MOVED: 'neutral',
}

/** Chaîne vide → undefined. */
const clean = (value?: string) => value?.trim() || undefined

export function DeliveryAttemptsPanel({
  missionId,
  canAdd,
  missionInProgress,
}: {
  missionId: string
  canAdd: boolean
  missionInProgress: boolean
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const listQ = useQuery({
    queryKey: ['attempts', missionId],
    queryFn: () => api.attempts.list(missionId),
    enabled: Boolean(missionId),
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AttemptValues>({ resolver: zodResolver(attemptSchema), defaultValues: EMPTY })

  const result = watch('result')
  // Quelqu'un a été rencontré : on demande son nom, sa qualité, sa CIN.
  const someoneFound =
    result === 'DELIVERED_IN_PERSON' || result === 'DELIVERED_TO_OTHER' || result === 'REFUSED'

  const createM = useMutation({
    mutationFn: (values: AttemptValues) =>
      api.attempts.create(missionId, {
        attemptedAt: clean(values.attemptedAt),
        result: values.result,
        receiverName: clean(values.receiverName),
        receiverCin: clean(values.receiverCin),
        receiverCapacity: clean(values.receiverCapacity),
        signed: someoneFound ? values.signed : undefined,
        visitCardLeft: someoneFound ? undefined : values.visitCardLeft,
        notes: clean(values.notes),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts', missionId] })
      toast(t('attempts.created'))
      reset(EMPTY)
    },
    onError: (error) => {
      const status = (error as { status?: number }).status
      const message = (error as { message?: string }).message
      if (status === 400 && message) toast(message, 'error')
      else toast(t(apiErrorKey(error)), 'error')
    },
  })

  const err = (key: keyof AttemptValues) =>
    errors[key] ? t(errors[key]?.message as string) : undefined

  const items = listQ.data ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{t('attempts.title')}</h2>
        <p className="text-sm text-ink-muted">{t('attempts.subtitle')}</p>
      </div>

      {canAdd && !missionInProgress && (
        <p className="text-sm text-ink-muted">{t('attempts.startFirst')}</p>
      )}

      {canAdd && missionInProgress && (
        <Card className="p-5">
          <form
            className="space-y-4"
            onSubmit={handleSubmit((v) => createM.mutate(v))}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('attempts.result')} required error={err('result')}>
                <Select {...register('result')}>
                  {DELIVERY_RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {t(`deliveryResult.${r}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label={t('attempts.attemptedAt')}
                hint={t('attempts.attemptedAtHint')}
                error={err('attemptedAt')}
              >
                <Input type="datetime-local" {...register('attemptedAt')} />
              </Field>
            </div>

            {someoneFound && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t('attempts.receiverName')}
                    required={result !== 'DELIVERED_IN_PERSON'}
                    error={err('receiverName')}
                  >
                    <Input {...register('receiverName')} dir="auto" />
                  </Field>
                  <Field label={t('attempts.receiverCin')} error={err('receiverCin')}>
                    <Input {...register('receiverCin')} dir="ltr" />
                  </Field>
                </div>
                <Field
                  label={t('attempts.receiverCapacity')}
                  required={result === 'DELIVERED_TO_OTHER'}
                  error={err('receiverCapacity')}
                >
                  <Input
                    {...register('receiverCapacity')}
                    dir="auto"
                    placeholder={t('attempts.receiverCapacityPlaceholder')}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" className="h-4 w-4" {...register('signed')} />
                  {t('attempts.signed')}
                </label>
              </>
            )}

            {!someoneFound && (
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" className="h-4 w-4" {...register('visitCardLeft')} />
                {t('attempts.visitCardLeft')}
              </label>
            )}

            <Field label={t('attempts.notes')} error={err('notes')}>
              <Textarea
                {...register('notes')}
                rows={2}
                dir="auto"
                placeholder={t('attempts.notesPlaceholder')}
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" icon={<Plus className="h-4 w-4" />} loading={createM.isPending}>
                {t('attempts.add')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
            icon={<MapPinned className="h-6 w-6" />}
            title={t('attempts.empty')}
            description={t('attempts.emptyHint')}
          />
        ) : (
          <ol className="divide-y divide-line">
            {items.map((attempt, index) => (
              <AttemptRow key={attempt.id} attempt={attempt} number={index + 1} />
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}

function AttemptRow({ attempt, number }: { attempt: DeliveryAttemptResponse; number: number }) {
  const { t } = useTranslation()
  const fmt = useFormatters()

  return (
    <li className="flex items-start gap-3.5 px-5 py-4">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-ink-muted tabnum">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={RESULT_TONE[attempt.result] ?? 'neutral'}>
            {t(`deliveryResult.${attempt.result}`)}
          </Badge>
          <span className="text-xs text-ink-muted tabnum">{fmt.dateTime(attempt.attemptedAt)}</span>
          {attempt.visitCardLeft && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <DoorClosed className="h-3.5 w-3.5" />
              {t('attempts.visitCardLeft')}
            </span>
          )}
        </div>
        {attempt.receiverName && (
          <p className="mt-1 text-sm text-ink" dir="auto">
            {attempt.receiverName}
            {attempt.receiverCapacity ? ` — ${attempt.receiverCapacity}` : ''}
            {attempt.receiverCin ? ` (${attempt.receiverCin})` : ''}
            {attempt.signed != null &&
              ` · ${t('attempts.signed')} : ${attempt.signed ? t('common.yes') : t('common.no')}`}
          </p>
        )}
        {attempt.notes && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted" dir="auto">
            {attempt.notes}
          </p>
        )}
      </div>
    </li>
  )
}
