import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { api, type CaseStatus } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { Button, Card } from '../ui'
import { cn } from '../../lib/utils'

/* Les 5 étapes d'un dossier : créé → mission → terrain → PV rédigé → PV approuvé. */
const STEPS = ['created', 'mission', 'field', 'draft', 'approved'] as const

type NextAction = {
  /** clé de la phrase dans progress.next.* */
  key: string
  /** texte du bouton (progress.action.*), absent = rien à faire, on attend */
  action?: string
  onClick?: () => void
  params?: Record<string, string>
}

/**
 * Bandeau « Prochaine étape » en haut du dossier : où en est le dossier
 * et un seul bouton pour continuer. Tout est calculé avec les données déjà
 * chargées ailleurs sur la page (mêmes clés de cache).
 */
export function CaseProgress({
  caseId,
  caseStatus,
  onGoTab,
  onNewMission,
}: {
  caseId: string
  caseStatus: CaseStatus
  onGoTab: (tab: string) => void
  onNewMission: () => void
}) {
  const { t } = useTranslation()
  const { can } = useAuth()

  const partiesQ = useQuery({
    queryKey: ['parties', caseId],
    queryFn: () => api.parties.listByCase(caseId),
  })
  const missionsQ = useQuery({
    queryKey: ['missions', 'by-case', caseId],
    queryFn: () => api.missions.listByCase(caseId),
    enabled: can('missions:viewCase'),
  })
  const docsQ = useQuery({
    queryKey: ['documents', caseId, { page: 0 }],
    queryFn: () => api.documents.listByCase(caseId, 0, 10),
  })

  if (partiesQ.isLoading || missionsQ.isLoading || docsQ.isLoading) return null

  const parties = partiesQ.data ?? []
  const missions = missionsQ.data ?? []
  const docs = docsQ.data?.content ?? []

  const hasMission = missions.length > 0
  const activeMission = missions.find((m) => m.status !== 'COMPLETED')
  const fieldDone = missions.some((m) => m.status === 'COMPLETED')
  const hasDraft = docs.some((d) => d.status === 'DRAFT' || d.status === 'DRAFT_AI')
  const awaiting = docs.some((d) => d.status === 'AWAITING_APPROVAL')
  const approved = docs.some((d) => d.status === 'APPROVED') || caseStatus === 'CLOSED'

  // étapes terminées, dans l'ordre
  const done = [true, hasMission, fieldDone, awaiting || approved, approved]
  const current = done.indexOf(false) // -1 = tout est fini

  // la prochaine chose à faire, du plus avancé au moins avancé
  let next: NextAction
  if (approved) {
    next = { key: 'approved', action: 'openPdf', onClick: () => onGoTab('documents') }
  } else if (awaiting) {
    next = can('documents:approve')
      ? { key: 'toApprove', action: 'approve', onClick: () => onGoTab('documents') }
      : { key: 'waitApproval' }
  } else if (hasDraft) {
    next = { key: 'toSubmit', action: 'review', onClick: () => onGoTab('documents') }
  } else if (fieldDone) {
    next = { key: 'toGenerate', action: 'generate', onClick: () => onGoTab('documents') }
  } else if (activeMission) {
    next = { key: 'waitField', params: { name: activeMission.assignedToUsername } }
  } else if (parties.length === 0) {
    next = { key: 'addParties', action: 'addParties', onClick: () => onGoTab('parties') }
  } else if (can('missions:create')) {
    next = { key: 'createMission', action: 'createMission', onClick: onNewMission }
  } else {
    next = { key: 'askMission' }
  }

  return (
    <Card className="p-4 sm:p-5">
      {/* Stepper */}
      <ol className="flex items-center gap-1.5 sm:gap-2" aria-label={t('progress.title')}>
        {STEPS.map((step, i) => {
          const isDone = done[i]
          const isCurrent = i === current
          return (
            <li key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isDone && 'bg-emerald-600 text-white',
                  isCurrent && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  !isDone && !isCurrent && 'bg-canvas text-ink-soft ring-1 ring-line',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'w-full truncate text-2xs sm:text-xs',
                  isCurrent ? 'font-semibold text-ink' : 'text-ink-muted',
                )}
              >
                {t(`progress.steps.${step}`)}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Prochaine étape */}
      <div className="mt-4 flex flex-col gap-3 rounded-lg bg-brand-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          {!next.action && <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />}
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wide text-brand-700">
              {approved ? t('progress.doneTitle') : t('progress.nextTitle')}
            </p>
            <p className="mt-0.5 text-sm text-ink">{t(`progress.next.${next.key}`, next.params)}</p>
          </div>
        </div>
        {next.action && (
          <Button
            size="sm"
            className="shrink-0"
            icon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}
            onClick={next.onClick}
          >
            {t(`progress.action.${next.action}`)}
          </Button>
        )}
      </div>
    </Card>
  )
}
