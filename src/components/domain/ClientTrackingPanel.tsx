/* =============================================================================
 * ClientTrackingPanel.tsx — Onglet « Suivi client » d'un dossier.
 *
 * S'appuie sur le nouveau contrôleur back-end CaseTrackingController :
 *   POST /api/cases/{caseId}/tracking-code  (ADMIN / ASSISTANT)
 *   GET  /api/public/tracking/{code}        (public)
 *
 * Le code n'est renvoyé qu'une seule fois par le back-end : on l'affiche, on
 * propose de le copier et on montre un aperçu de la vue client (endpoint public)
 * pour tester la fonctionnalité sans quitter l'application.
 * ========================================================================== */

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Info,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { useToast } from '../Toast'
import { Button, Card, EmptyState, Skeleton } from '../ui'
import { TrackingResult } from './TrackingResult'
import { apiErrorKey } from '../../lib/format'

export function ClientTrackingPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const { can } = useAuth()
  const { toast } = useToast()

  const canManage = can('tracking:manage')

  // Le code de suivi n'est visible que juste après sa génération (le back-end
  // ne stocke qu'un hash) : on le garde en mémoire le temps de la session.
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateM = useMutation({
    mutationFn: () => api.tracking.generate(caseId),
    onSuccess: (data) => {
      setCode(data.trackingCode)
      toast(t('tracking.generated'))
    },
    onError: (error) => {
      const status = (error as { status?: number }).status
      // Le back-end lève une RuntimeException si un code existe déjà (→ 500).
      const duplicate = status === 500 || status === 409
      toast(t(duplicate ? 'tracking.alreadyExists' : apiErrorKey(error)), 'error')
    },
  })

  const previewQ = useQuery({
    queryKey: ['tracking', 'preview', code],
    queryFn: () => api.tracking.publicTrack(code as string),
    enabled: Boolean(code),
    retry: false,
  })

  const copy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast(t('tracking.copied'))
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast(t('tracking.copyFailed'), 'error')
    }
  }

  const openClientView = () => {
    if (!code) return
    window.open(`/suivi/${encodeURIComponent(code)}`, '_blank', 'noopener')
  }

  if (!canManage) {
    return (
      <Card>
        <EmptyState icon={<AlertTriangle className="h-6 w-6" />} title={t('errors.forbidden')} />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t('tracking.panelTitle')}</h2>
          <p className="text-sm text-ink-muted">{t('tracking.panelSubtitle')}</p>
        </div>
        {!code && (
          <Button
            icon={<ScanSearch className="h-4 w-4" />}
            loading={generateM.isPending}
            onClick={() => generateM.mutate()}
          >
            {generateM.isPending ? t('tracking.generating') : t('tracking.generate')}
          </Button>
        )}
      </div>

      {!code ? (
        <>
          <Card>
            <EmptyState
              icon={<ScanSearch className="h-6 w-6" />}
              title={t('tracking.empty')}
              description={t('tracking.emptyHint')}
              action={
                <Button
                  icon={<ScanSearch className="h-4 w-4" />}
                  loading={generateM.isPending}
                  onClick={() => generateM.mutate()}
                >
                  {generateM.isPending ? t('tracking.generating') : t('tracking.generate')}
                </Button>
              }
            />
          </Card>

          <div
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-line bg-canvas/50 px-3.5 py-3 text-sm text-ink-muted"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
            <p className="leading-relaxed">{t('tracking.actionHint')}</p>
          </div>
        </>
      ) : (
        <>
          <Card className="p-5 sm:p-6">
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-soft">
              {t('tracking.yourCode')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <code className="tabnum select-all rounded-lg border border-line bg-canvas/60 px-4 py-2.5 text-lg font-bold tracking-widest text-ink">
                {code}
              </code>
              <Button
                variant="outline"
                size="sm"
                icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                onClick={copy}
              >
                {copied ? t('tracking.copied') : t('common.copy')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink className="h-4 w-4" />}
                onClick={openClientView}
              >
                {t('tracking.openClientView')}
              </Button>
            </div>

            <div
              role="note"
              className="mt-4 flex items-start gap-2.5 rounded-lg border border-gold-300 bg-gold-50 px-3.5 py-3 text-sm text-gold-800"
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              <p className="leading-relaxed">{t('tracking.actionHint')}</p>
            </div>
          </Card>

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-ink">{t('tracking.preview')}</h3>
              <p className="text-sm text-ink-muted">{t('tracking.previewHint')}</p>
            </div>

            {previewQ.isLoading ? (
              <Card className="space-y-4 p-5">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
              </Card>
            ) : previewQ.isError ? (
              <Card>
                <EmptyState
                  icon={<AlertTriangle className="h-6 w-6" />}
                  title={t('tracking.loadFailed')}
                  description={t(apiErrorKey(previewQ.error))}
                  action={
                    <Button variant="outline" onClick={() => previewQ.refetch()}>
                      {t('common.retry')}
                    </Button>
                  }
                />
              </Card>
            ) : previewQ.data ? (
              <TrackingResult data={previewQ.data} />
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
