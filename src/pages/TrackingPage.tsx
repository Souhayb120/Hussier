/* =============================================================================
 * TrackingPage.tsx — Suivi de dossier côté client (page publique).
 *
 * Consomme GET /api/public/tracking/{code} du nouveau CaseTrackingController.
 * Accessible sans authentification : le client saisit le code de suivi fourni
 * par l'étude et consulte l'avancement de son dossier, sans donnée sensible.
 *
 * Route : /suivi  et  /suivi/:code (lien partageable).
 * ========================================================================== */

import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ScanSearch, Scale, ShieldCheck } from 'lucide-react'
import { api } from '../api/client'
import { Button, Card, Input } from '../components/ui'
import { TrackingResult } from '../components/domain/TrackingResult'
import { LanguageSwitcher } from '../components/layout'

export default function TrackingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { code: codeParam } = useParams<{ code?: string }>()
  const [searchParams] = useSearchParams()

  const initial = (codeParam ?? searchParams.get('code') ?? '').trim()
  const [input, setInput] = useState(initial)
  const [query, setQuery] = useState(initial)

  const resultQ = useQuery({
    queryKey: ['public-tracking', query],
    queryFn: () => api.tracking.publicTrack(query),
    enabled: query.length > 0,
    retry: false,
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = input.trim()
    if (!next) return
    setQuery(next)
    navigate(`/suivi/${encodeURIComponent(next)}`, { replace: true })
  }

  const status = (resultQ.error as { status?: number } | null)?.status
  const invalid = resultQ.isError && status !== 0

  return (
    <div className="min-h-screen bg-canvas">
      {/* Barre supérieure */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/suivi" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm ring-1 ring-white/15">
              <Scale className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-ink">
                {t('app.name')}
              </span>
              <span className="block text-2xs text-ink-muted">{t('app.tagline')}</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="hidden text-sm font-medium text-brand-700 transition hover:text-brand-800 sm:block"
            >
              {t('tracking.backToLogin')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('tracking.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">{t('tracking.subtitle')}</p>
        </div>

        {/* Recherche par code */}
        <Card className="mx-auto mt-7 max-w-xl p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-3" noValidate>
            <label htmlFor="tracking-code" className="label">
              {t('tracking.code')}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <ScanSearch className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-soft" />
                <Input
                  id="tracking-code"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('tracking.codePlaceholder')}
                  autoComplete="off"
                  spellCheck={false}
                  dir="ltr"
                  className="ps-9 font-semibold uppercase tracking-widest"
                />
              </div>
              <Button
                type="submit"
                loading={resultQ.isFetching}
                disabled={!input.trim()}
                icon={<ScanSearch className="h-4 w-4" />}
              >
                {resultQ.isFetching ? t('tracking.checking') : t('tracking.check')}
              </Button>
            </div>
          </form>

          {query.length === 0 && (
            <p className="mt-4 text-xs text-ink-muted">{t('tracking.helpText')}</p>
          )}
        </Card>

        {/* États : erreur / invalide */}
        {(invalid || status === 0) && (
          <Card className="mx-auto mt-5 max-w-xl border-red-200 bg-red-50/60 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-ink">
                  {status === 0 ? t('errors.loadFailed') : t('tracking.invalidTitle')}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {status === 0 ? t('errors.network') : t('tracking.invalid')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Résultat */}
        {query.length > 0 && resultQ.isSuccess && resultQ.data && (
          <div className="mt-6 animate-slide-up">
            <TrackingResult data={resultQ.data} />
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {t('tracking.privacy')}
        </p>
      </main>
    </div>
  )
}
