import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CircleDollarSign, Pencil, Plus, Wallet } from 'lucide-react'
import { api, type BillingResponse } from '../../api/client'
import { billingSchema, type BillingValues } from '../../lib/validators'
import { useAuth } from '../../auth/AuthProvider'
import { useToast } from '../Toast'
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  Skeleton,
  StatusBadge,
  Textarea,
} from '../ui'
import { apiErrorKey, useFormatters } from '../../lib/format'
import { cn } from '../../lib/utils'

/* --------------------------- Formulaire facturation ---------------------- */

function BillingFormDialog({
  open,
  onClose,
  caseId,
  billing,
}: {
  open: boolean
  onClose: () => void
  caseId: string
  billing: BillingResponse | null
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const editing = Boolean(billing)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BillingValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: { totalAmount: 0, amountPaid: 0, description: '' },
  })

  useEffect(() => {
    if (!open) return
    reset(
      billing
        ? {
            totalAmount: billing.totalAmount,
            amountPaid: billing.amountPaid,
            description: billing.description ?? '',
          }
        : { totalAmount: 0, amountPaid: 0, description: '' },
    )
  }, [open, billing, reset])

  const mutation = useMutation({
    mutationFn: (values: BillingValues) => {
      const payload = {
        totalAmount: Number(values.totalAmount),
        amountPaid: Number(values.amountPaid),
        description: values.description?.trim() || undefined,
      }
      return billing ? api.billing.update(caseId, payload) : api.billing.create(caseId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', caseId] })
      toast(editing ? t('billing.updated') : t('billing.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const previewTotal = Number(watch('totalAmount')) || 0
  const previewPaid = Number(watch('amountPaid')) || 0
  const previewRemaining = Math.max(previewTotal - previewPaid, 0)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('billing.editTitle') : t('billing.createTitle')}
      description={t('billing.formHint')}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="billing-form" loading={mutation.isPending}>
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <form
        id="billing-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('billing.totalAmount')}
            hint={t('billing.currency')}
            required
            error={errors.totalAmount ? t(errors.totalAmount.message as string) : undefined}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              {...register('totalAmount')}
            />
          </Field>

          <Field
            label={t('billing.amountPaid')}
            hint={t('billing.currency')}
            required
            error={errors.amountPaid ? t(errors.amountPaid.message as string) : undefined}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              {...register('amountPaid')}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line bg-canvas/50 px-4 py-3">
          <span className="text-sm text-ink-muted">{t('billing.remainingAmount')}</span>
          <span className="tabnum text-sm font-semibold text-ink">
            {fmt.number(previewRemaining)} {t('billing.currency')}
          </span>
        </div>

        <Field label={t('billing.description')}>
          <Textarea
            {...register('description')}
            rows={4}
            placeholder={t('billing.descriptionPlaceholder')}
          />
        </Field>
      </form>
    </Dialog>
  )
}

/* ------------------------------ Montant ---------------------------------- */

function Amount({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'neutral' | 'success' | 'danger'
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border border-line bg-canvas/40 p-4">
      <dt className="text-2xs font-medium uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd
        className={cn(
          'mt-1 tabnum text-xl font-bold',
          tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-red-600' : 'text-ink',
        )}
      >
        {fmt.number(value)}
        <span className="ms-1 text-sm font-medium text-ink-muted">{t('billing.currency')}</span>
      </dd>
    </div>
  )
}

/* ------------------------------ Panneau ---------------------------------- */

export function BillingPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { can } = useAuth()
  const canManage = can('billing:manage')

  const [formOpen, setFormOpen] = useState(false)

  const billingQ = useQuery({
    queryKey: ['billing', caseId],
    queryFn: () => api.billing.get(caseId),
    retry: false,
  })

  const errorStatus = (billingQ.error as { status?: number } | null)?.status
  const offline = billingQ.isError && errorStatus === 0

  if (billingQ.isLoading) {
    return (
      <Card className="space-y-4 p-5">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (offline) {
    return (
      <Card>
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title={t('errors.loadFailed')}
          description={t('errors.network')}
          action={
            <Button variant="outline" onClick={() => billingQ.refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      </Card>
    )
  }

  const billing = billingQ.data ?? null

  // L'accès à cet onglet est déjà réservé aux ADMIN / ASSISTANT (billing:manage).
  // Tant qu'aucune facturation n'existe pour le dossier, le back-end répond par
  // une erreur au GET (403 ou 500 selon le déploiement, faute de 404 propre) :
  // on considère donc toute erreur de lecture — hors panne réseau — comme
  // « facturation non configurée » et on propose la création.
  if (!billing) {
    return (
      <div className="space-y-4">
        <Card>
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title={t('billing.empty')}
            description={t('billing.emptyHint')}
            action={
              canManage ? (
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                  {t('billing.create')}
                </Button>
              ) : undefined
            }
          />
        </Card>
        <BillingFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          caseId={caseId}
          billing={null}
        />
      </div>
    )
  }

  const percent =
    billing.totalAmount > 0
      ? Math.min(100, Math.round((billing.amountPaid / billing.totalAmount) * 100))
      : billing.amountPaid > 0
        ? 100
        : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t('billing.title')}</h2>
          <p className="text-sm text-ink-muted">{t('billing.subtitle')}</p>
        </div>
        {canManage && (
          <Button
            variant="outline"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => setFormOpen(true)}
          >
            {t('common.edit')}
          </Button>
        )}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge value={billing.status} label={t(`paymentStatus.${billing.status}`)} />
          <span className="text-xs text-ink-muted">
            {t('billing.createdAt')}: {fmt.dateTime(billing.createdAt)}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <Amount label={t('billing.totalAmount')} value={billing.totalAmount} />
          <Amount label={t('billing.amountPaid')} value={billing.amountPaid} tone="success" />
          <Amount
            label={t('billing.remainingAmount')}
            value={billing.remainingAmount}
            tone={billing.remainingAmount > 0 ? 'danger' : 'neutral'}
          />
        </dl>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {t('billing.progress')}
            </span>
            <span className="tabnum font-medium text-ink">{percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/70">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                billing.status === 'PAID' ? 'bg-emerald-500' : 'bg-brand-500',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {billing.description && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-soft">
              {t('billing.description')}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
              {billing.description}
            </p>
          </div>
        )}
      </Card>

      <BillingFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        caseId={caseId}
        billing={billing}
      />
    </div>
  )
}
