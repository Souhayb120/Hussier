/* =============================================================================
 * TrackingResult.tsx — Rendu de la vue « suivi client ».
 *
 * Représentation partagée de la réponse publique
 * GET /api/public/tracking/{code}. Utilisée à la fois par l'aperçu interne
 * (onglet « Suivi client » du dossier) et par la page publique /suivi.
 * ========================================================================== */

import { useTranslation } from 'react-i18next'
import { FileCheck2, Hourglass } from 'lucide-react'
import type { ClientTrackingResponse } from '../../api/client'
import { Badge, Card, StatusBadge } from '../ui'
import { useFormatters } from '../../lib/format'
import { cn } from '../../lib/utils'

function Money({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'neutral' | 'success' | 'danger'
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
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
        <span className="ms-1 text-sm font-medium text-ink-muted">{t('tracking.currency')}</span>
      </dd>
    </div>
  )
}

export function TrackingResult({ data }: { data: ClientTrackingResponse }) {
  const { t } = useTranslation()

  // Le back-end renvoie le libellé d'avancement en français ; on le traduit
  // quand il est connu, sinon on l'affiche tel quel (repli sûr).
  const progressKeys: Record<string, string> = {
    'Dossier reçu': 'tracking.progressReceived',
    'Dossier pris en charge': 'tracking.progressAssigned',
    'Traitement en cours': 'tracking.progressInProgress',
    'Rapport en préparation': 'tracking.progressAwaitingApproval',
    'Rapport prêt': 'tracking.progressClosed',
  }
  const progressLabel = progressKeys[data.progress]
    ? t(progressKeys[data.progress])
    : data.progress

  const hasBilling = data.paymentStatus !== null
  const percent =
    data.totalAmount > 0
      ? Math.min(100, Math.round((data.amountPaid / data.totalAmount) * 100))
      : data.amountPaid > 0
        ? 100
        : 0

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                data.reportReady ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-600',
              )}
            >
              {data.reportReady ? (
                <FileCheck2 className="h-5 w-5" />
              ) : (
                <Hourglass className="h-5 w-5" />
              )}
            </span>
            <div>
              <p className="text-2xs font-medium uppercase tracking-wide text-ink-soft">
                {t('tracking.progress')}
              </p>
              <p className="text-lg font-semibold text-ink">{progressLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{data.caseRef}</Badge>
            {data.reportReady ? (
              <Badge tone="success">{t('tracking.reportReady')}</Badge>
            ) : (
              <Badge tone="warning">{t('tracking.reportNotReady')}</Badge>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">{t('tracking.billing')}</h3>
          {hasBilling && (
            <StatusBadge
              value={data.paymentStatus as string}
              label={t(`paymentStatus.${data.paymentStatus}`)}
            />
          )}
        </div>

        {hasBilling ? (
          <>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <Money label={t('tracking.totalAmount')} value={data.totalAmount} />
              <Money label={t('tracking.amountPaid')} value={data.amountPaid} tone="success" />
              <Money
                label={t('tracking.remainingAmount')}
                value={data.remainingAmount}
                tone={data.remainingAmount > 0 ? 'danger' : 'neutral'}
              />
            </dl>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>{t('tracking.paymentProgress')}</span>
                <span className="tabnum font-medium text-ink">{percent}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/70">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    data.remainingAmount <= 0 ? 'bg-emerald-500' : 'bg-brand-500',
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">{t('tracking.billingNone')}</p>
        )}
      </Card>
    </div>
  )
}
