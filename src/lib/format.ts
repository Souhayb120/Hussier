/* =============================================================================
 * format.ts — Formatage des dates et des nombres selon la langue active.
 * ========================================================================== */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiError } from '../api/client'

function localeOf(lang: string): string {
  return lang.startsWith('ar') ? 'ar-MA-u-nu-latn' : 'fr-MA'
}

export interface Formatters {
  date: (value?: string | null) => string
  dateTime: (value?: string | null) => string
  dateLong: (value?: string | null) => string
  number: (value?: number | null) => string
}

export function createFormatters(lang: string): Formatters {
  const locale = localeOf(lang)

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const dateLongFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateTimeFmt = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const numberFmt = new Intl.NumberFormat(locale)

  const parse = (value?: string | null): Date | null => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  return {
    date: (value) => {
      const d = parse(value)
      return d ? dateFmt.format(d) : '—'
    },
    dateLong: (value) => {
      const d = parse(value)
      return d ? dateLongFmt.format(d) : '—'
    },
    dateTime: (value) => {
      const d = parse(value)
      return d ? dateTimeFmt.format(d) : '—'
    },
    number: (value) => (value === null || value === undefined ? '—' : numberFmt.format(value)),
  }
}

export function useFormatters(): Formatters {
  const { i18n } = useTranslation()
  return useMemo(() => createFormatters(i18n.language || 'fr'), [i18n.language])
}

/** Convertit une date ISO en valeur pour <input type="date"> (yyyy-MM-dd). */
export function toDateInput(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

/** Convertit une date ISO en valeur pour <input type="datetime-local">. */
export function toDateTimeInput(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 16)
}

/** Indique si une échéance (yyyy-MM-dd) est dépassée. */
export function isOverdue(deadline?: string | null): boolean {
  if (!deadline) return false
  const d = new Date(deadline + 'T23:59:59')
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now()
}

/**
 * Convertit une erreur API en clé i18n lisible (namespace « errors »).
 */
export function apiErrorKey(error: unknown): string {
  const status = (error as ApiError | undefined)?.status
  switch (status) {
    case 0:
      return 'errors.network'
    case 401:
      return 'errors.unauthorized'
    case 403:
      return 'errors.forbidden'
    case 404:
      return 'errors.notFound'
    case 400:
    case 422:
      return 'errors.validation'
    default:
      return 'errors.generic'
  }
}
