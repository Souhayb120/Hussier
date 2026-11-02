import { useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Eye, FileText, FolderOpen, X } from 'lucide-react'
import {
  api,
  DOCUMENT_KINDS,
  type DocumentKind,
  type DocumentResponse,
  type DocumentSortField,
  type DocumentStatus,
} from '../api/client'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  EmptyState,
  Input,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { PageHeader } from '../components/layout'
import { apiErrorKey, useFormatters } from '../lib/format'
import { openBlob, saveBlob } from '../lib/files'

const DOCUMENT_STATUSES: DocumentStatus[] = ['DRAFT_AI', 'DRAFT', 'AWAITING_APPROVAL', 'APPROVED']
const PAGE_SIZES = [10, 25, 50]

/**
 * Page « Documents » : tous les documents générés de l'étude (ADMIN / ASSISTANT).
 * Recherche, filtres, tri et pagination sont faits par le serveur.
 */
export default function DocumentsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const fmt = useFormatters()

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<'ALL' | DocumentKind>('ALL')
  const [status, setStatus] = useState<'ALL' | DocumentStatus>('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sortBy, setSortBy] = useState<DocumentSortField>('createdAt')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')

  // On attend que l'utilisateur arrête de taper (350 ms) avant d'interroger le serveur.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const badRange = from !== '' && to !== '' && from > to
  const isFiltering =
    debouncedSearch !== '' || kind !== 'ALL' || status !== 'ALL' || from !== '' || to !== ''

  const query = useQuery({
    queryKey: ['documents', { page, size, search: debouncedSearch, kind, status, from, to, sortBy, direction }],
    queryFn: () =>
      api.documents.search({
        page,
        size,
        search: debouncedSearch,
        kind: kind === 'ALL' ? undefined : kind,
        status: status === 'ALL' ? undefined : status,
        from: from || undefined,
        to: to || undefined,
        sortBy,
        direction,
      }),
    enabled: !badRange,
    // garde l'ancienne liste affichée pendant la recherche (pas de clignotement)
    placeholderData: (previous) => previous,
  })

  // PDF d'un document approuvé : ouvrir dans un onglet ou télécharger.
  const pdfM = useMutation({
    mutationFn: ({ doc, inline }: { doc: DocumentResponse; inline: boolean }) =>
      api.documents.pdf(doc.id, inline),
    onSuccess: (blob, { doc, inline }) => {
      if (inline) openBlob(blob)
      else saveBlob(blob, `محضر-${(doc.caseRef ?? 'document').replace(/\//g, '-')}.pdf`)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const rows = query.data?.content ?? []

  // Un clic sur une colonne trie dessus ; un deuxième clic inverse l'ordre.
  const changeSort = (field: DocumentSortField) => {
    if (sortBy === field) {
      setDirection(direction === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      // dates : les plus récentes d'abord ; texte : A → Z
      setDirection(field === 'createdAt' || field === 'approvedAt' ? 'desc' : 'asc')
    }
    setPage(0)
  }

  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setKind('ALL')
    setStatus('ALL')
    setFrom('')
    setTo('')
    setPage(0)
  }

  const sortHeader = (field: DocumentSortField, label: string) => (
    <SortHeader
      label={label}
      active={sortBy === field}
      direction={direction}
      onClick={() => changeSort(field)}
    />
  )

  return (
    <div>
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title={t('documentsPage.title')}
        subtitle={t('documentsPage.subtitle')}
      />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('documentsPage.searchPlaceholder')}
          />
          <Select
            aria-label={t('documents.kind')}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as 'ALL' | DocumentKind)
              setPage(0)
            }}
          >
            <option value="ALL">{t('documentsPage.allKinds')}</option>
            {DOCUMENT_KINDS.map((value) => (
              <option key={value} value={value}>
                {t(`documentKind.${value}`)}
              </option>
            ))}
          </Select>
          <Select
            aria-label={t('documents.status')}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'ALL' | DocumentStatus)
              setPage(0)
            }}
          >
            <option value="ALL">{t('documentsPage.allStatuses')}</option>
            {DOCUMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`documentStatus.${value}`)}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            aria-label={t('documentsPage.from')}
            title={t('documentsPage.from')}
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value)
              setPage(0)
            }}
          />
          <Input
            type="date"
            aria-label={t('documentsPage.to')}
            title={t('documentsPage.to')}
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value)
              setPage(0)
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          {badRange ? (
            <span className="text-red-600">{t('documentsPage.badRange')}</span>
          ) : (
            <span>{query.data ? `${query.data.totalElements} ${t('common.results')}` : ''}</span>
          )}
          {isFiltering && (
            <Button variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={resetFilters}>
              {t('documentsPage.reset')}
            </Button>
          )}
          <label className="ms-auto flex items-center gap-2">
            {t('documentsPage.perPage')}
            <Select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value))
                setPage(0)
              }}
              className="w-20"
            >
              {PAGE_SIZES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {query.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={isFiltering ? t('documentsPage.noResults') : t('documentsPage.empty')}
            description={isFiltering ? undefined : t('documentsPage.emptyHint')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-xs uppercase tracking-wide text-ink-soft">
                  <Th sort={sortBy === 'caseRef' ? direction : undefined}>
                    {sortHeader('caseRef', t('documentsPage.caseRef'))}
                  </Th>
                  <Th sort={sortBy === 'clientName' ? direction : undefined}>
                    {sortHeader('clientName', t('cases.client'))}
                  </Th>
                  <Th sort={sortBy === 'kind' ? direction : undefined}>
                    {sortHeader('kind', t('documents.kind'))}
                  </Th>
                  <Th sort={sortBy === 'status' ? direction : undefined}>
                    {sortHeader('status', t('documents.status'))}
                  </Th>
                  <Th sort={sortBy === 'createdAt' ? direction : undefined}>
                    {sortHeader('createdAt', t('documents.createdAt'))}
                  </Th>
                  <Th sort={sortBy === 'approvedAt' ? direction : undefined}>
                    {sortHeader('approvedAt', t('documentsPage.approvedAt'))}
                  </Th>
                  <th className="px-5 py-3 text-end font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((doc) => {
                  const openCase = () => navigate(`/dossiers/${doc.caseId}?tab=documents`)
                  const busy = pdfM.isPending && pdfM.variables?.doc.id === doc.id
                  return (
                    <tr
                      key={doc.id}
                      onClick={openCase}
                      className="cursor-pointer transition hover:bg-canvas/70"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink" dir="ltr">
                        {doc.caseRef}
                      </td>
                      <td className="max-w-[14rem] px-5 py-3.5">
                        <p className="truncate text-ink">{doc.caseClientName ?? '—'}</p>
                      </td>
                      <td className="max-w-[16rem] px-5 py-3.5">
                        <p className="truncate text-ink-muted">{t(`documentKind.${doc.kind}`)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge value={doc.status} label={t(`documentStatus.${doc.status}`)} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-muted">
                        {fmt.date(doc.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-muted">
                        {doc.approvedAt ? (
                          <>
                            {fmt.date(doc.approvedAt)}
                            {doc.approvedByUsername && (
                              <span className="block text-xs text-ink-soft">{doc.approvedByUsername}</span>
                            )}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {doc.status === 'APPROVED' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('documents.pdfView')}
                                title={t('documents.pdfView')}
                                disabled={busy}
                                onClick={() => pdfM.mutate({ doc, inline: true })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('documents.pdfDownload')}
                                title={t('documents.pdfDownload')}
                                disabled={busy}
                                onClick={() => pdfM.mutate({ doc, inline: false })}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('documentsPage.openCase')}
                            title={t('documentsPage.openCase')}
                            onClick={openCase}
                          >
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
    </div>
  )
}

/** En-tête de colonne avec l'état du tri pour les lecteurs d'écran. */
function Th({ sort, children }: { sort?: 'asc' | 'desc'; children: ReactNode }) {
  return (
    <th
      className="px-5 py-3 text-start font-semibold"
      aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}
    >
      {children}
    </th>
  )
}

function SortHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
}) {
  const Icon = !active ? ChevronsUpDown : direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-ink ${
        active ? 'text-brand-700' : ''
      }`}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}
