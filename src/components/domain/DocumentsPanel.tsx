import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {
  api,
  DOCUMENT_KINDS,
  type DocumentKind,
  type DocumentResponse,
} from '../../api/client'
import { documentSchema, type DocumentValues } from '../../lib/validators'
import { useAuth } from '../../auth/AuthProvider'
import { useToast } from '../Toast'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dialog,
  EmptyState,
  Field,
  Pagination,
  Select,
  Skeleton,
  StatusBadge,
  Textarea,
} from '../ui'
import { apiErrorKey, useFormatters } from '../../lib/format'
import { truncate } from '../../lib/utils'

const DEFAULT_KIND: DocumentKind = 'CONSTAT_LIEU'

/* --------------------------- Formulaire document ------------------------- */

function DocumentFormDialog({
  open,
  onClose,
  caseId,
  document,
}: {
  open: boolean
  onClose: () => void
  caseId: string
  document?: DocumentResponse | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const editing = Boolean(document)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { kind: DEFAULT_KIND, content: '' },
  })

  useEffect(() => {
    if (!open) return
    reset(
      document
        ? { kind: document.kind, content: document.content ?? '' }
        : { kind: DEFAULT_KIND, content: '' },
    )
  }, [open, document, reset])

  const mutation = useMutation({
    mutationFn: (values: DocumentValues) => {
      const payload = { kind: values.kind, content: values.content?.trim() || undefined }
      return document
        ? api.documents.update(document.id, payload)
        : api.documents.create(caseId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', caseId] })
      toast(editing ? t('documents.updated') : t('documents.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('documents.editTitle') : t('documents.newTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="document-form" loading={mutation.isPending}>
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <form
        id="document-form"
        className="space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <Field
          label={t('documents.kind')}
          required
          error={errors.kind ? t(errors.kind.message as string) : undefined}
        >
          <Select {...register('kind')}>
            {DOCUMENT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {t(`documentKind.${kind}`)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t('documents.content')}>
          <Textarea
            {...register('content')}
            rows={12}
            placeholder={t('documents.contentPlaceholder')}
            className="font-normal leading-relaxed"
          />
        </Field>
      </form>
    </Dialog>
  )
}

/* --------------------------- Consultation document ----------------------- */

function DocumentViewDialog({
  documentId,
  onClose,
  onEdit,
}: {
  documentId: string | null
  onClose: () => void
  onEdit: (doc: DocumentResponse) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { can } = useAuth()

  const detailQ = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => api.documents.get(documentId as string),
    enabled: Boolean(documentId),
  })

  const doc = detailQ.data ?? null
  const editable = doc && doc.status !== 'APPROVED' && can('documents:prepare')

  return (
    <Dialog
      open={documentId !== null}
      onClose={onClose}
      title={doc ? t(`documentKind.${doc.kind}`) : t('documents.view')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.close')}
          </Button>
          {editable && (
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(doc)}>
              {t('common.edit')}
            </Button>
          )}
        </>
      }
    >
      {detailQ.isLoading || !doc ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={doc.status} label={t(`documentStatus.${doc.status}`)} />
            {doc.status === 'DRAFT_AI' && (
              <Sparkles className="h-4 w-4 text-gold-600" aria-label={t('documentStatus.DRAFT_AI')} />
            )}
            <span className="text-xs text-ink-muted">{fmt.dateTime(doc.createdAt)}</span>
            {doc.status === 'APPROVED' && (
              <Badge tone="success">{t('documents.locked')}</Badge>
            )}
          </div>
          {doc.status === 'DRAFT_AI' && (
            <div
              role="note"
              className="flex items-start gap-2.5 rounded-lg border border-gold-300 bg-gold-50 px-3.5 py-3 text-sm text-gold-800"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              <p className="leading-relaxed">{t('documents.aiBanner')}</p>
            </div>
          )}
          <div className="max-h-[52vh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-canvas/40 p-4 text-sm leading-relaxed text-ink scroll-thin">
            {doc.content || t('common.none')}
          </div>
        </div>
      )}
    </Dialog>
  )
}

/* --------------------------- Brouillon IA -------------------------------- */

function AiDraftDialog({
  open,
  onClose,
  onConfirm,
  working,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (kind: DocumentKind) => void
  working: boolean
}) {
  const { t } = useTranslation()
  const [kind, setKind] = useState<DocumentKind>(DEFAULT_KIND)

  useEffect(() => {
    if (open) setKind(DEFAULT_KIND)
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('documents.generateAi')}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={working}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            icon={<Sparkles className="h-4 w-4" />}
            onClick={() => onConfirm(kind)}
            loading={working}
          >
            {t('documents.generateAi')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-muted">{t('documents.aiChooseKind')}</p>
        <Field label={t('documents.kind')} required>
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as DocumentKind)}
            disabled={working}
          >
            {DOCUMENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`documentKind.${k}`)}
              </option>
            ))}
          </Select>
        </Field>
        {/* Ce dont le type choisi a besoin (parties, visites, observations…) */}
        <p className="rounded-lg border border-line bg-canvas/50 px-3.5 py-2.5 text-sm leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">{t('documents.kindHint')} : </span>
          {t(`documentKindHint.${kind}`)}
        </p>
      </div>
    </Dialog>
  )
}

/* ------------------------------ Liste documents -------------------------- */

export function DocumentsPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const canApprove = can('documents:approve')
  const canDelete = can('documents:delete')

  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DocumentResponse | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<DocumentResponse | null>(null)
  const [pendingSubmit, setPendingSubmit] = useState<DocumentResponse | null>(null)
  const [pendingApprove, setPendingApprove] = useState<DocumentResponse | null>(null)

  const listQ = useQuery({
    queryKey: ['documents', caseId, { page }],
    queryFn: () => api.documents.listByCase(caseId, page, 10),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['documents', caseId] })
    queryClient.invalidateQueries({ queryKey: ['case', caseId] })
  }

  const saveReset = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const aiM = useMutation({
    mutationFn: (kind: DocumentKind) => api.documents.generateAiDraft(caseId, kind),
    onSuccess: (data) => {
      invalidate()
      toast(t('documents.aiGenerated'))
      setAiOpen(false)
      setViewingId(data.id)
      setPage(0)
    },
    onError: (error) => {
      const status = (error as { status?: number }).status
      // 400 : le back-end explique ce qui manque (ex : ajouter les visites, mauvais type de notification).
      const message = (error as { message?: string }).message
      if (status === 400 && message) toast(message, 'error')
      else toast(status === 403 ? t('errors.forbidden') : t('documents.aiFailed'), 'error')
      setAiOpen(false)
    },
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => api.documents.remove(id),
    onSuccess: () => {
      invalidate()
      toast(t('documents.deleted'))
      setPendingDelete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const submitM = useMutation({
    mutationFn: (id: string) => api.documents.submit(id),
    onSuccess: () => {
      invalidate()
      toast(t('documents.submitted'))
      setPendingSubmit(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const approveM = useMutation({
    mutationFn: (id: string) => api.documents.approve(id),
    onSuccess: () => {
      invalidate()
      toast(t('documents.approved'))
      setPendingApprove(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const docs = listQ.data?.content ?? []
  const busy = aiM.isPending || deleteM.isPending || submitM.isPending || approveM.isPending

  const openEdit = (doc: DocumentResponse) => {
    setEditing(doc)
    setViewingId(null)
    setFormOpen(true)
  }

  const total = listQ.data?.totalElements ?? 0
  const actionsDisabled = useMemo(() => busy, [busy])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t('documents.title')}</h2>
          <p className="text-sm text-ink-muted">{t('documents.statusCount', { count: total })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={<Bot className="h-4 w-4" />}
            disabled={actionsDisabled}
            onClick={() => setAiOpen(true)}
            title={t('documents.generateAiHint')}
          >
            {aiM.isPending ? t('documents.aiWorking') : t('documents.generateAi')}
          </Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}>
            {t('documents.new')}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
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
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={t('documents.empty')}
            description={t('documents.emptyHint')}
            action={
              <Button icon={<Bot className="h-4 w-4" />} onClick={() => setAiOpen(true)}>
                {t('documents.generateAi')}
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {docs.map((doc) => {
              const canSubmit = doc.status === 'DRAFT' || doc.status === 'DRAFT_AI'
              const canApproveDoc = canApprove && doc.status === 'AWAITING_APPROVAL'
              const canEdit = doc.status !== 'APPROVED'
              const canRemove = canDelete && doc.status !== 'APPROVED'
              return (
                <li key={doc.id} className="p-5 transition hover:bg-canvas/50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-ink">{t(`documentKind.${doc.kind}`)}</span>
                        {doc.status === 'DRAFT_AI' && (
                          <Sparkles
                            className="h-3.5 w-3.5 text-gold-600"
                            aria-label={t('documentStatus.DRAFT_AI')}
                          />
                        )}
                        <StatusBadge value={doc.status} label={t(`documentStatus.${doc.status}`)} />
                        <span className="text-xs text-ink-muted">{fmt.dateTime(doc.createdAt)}</span>
                      </div>
                      {doc.approvedAt && (
                        <p className="mt-1 text-xs text-emerald-700">
                          {t('documents.approvedBy', {
                            name: doc.approvedByUsername ?? '—',
                            date: fmt.dateTime(doc.approvedAt),
                          })}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-ink-muted">
                        {doc.content ? truncate(doc.content.replace(/\s+/g, ' '), 180) : t('common.none')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => setViewingId(doc.id)}
                      >
                        {t('common.view')}
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Pencil className="h-4 w-4" />}
                          onClick={() => openEdit(doc)}
                        >
                          {t('common.edit')}
                        </Button>
                      )}
                      {canSubmit && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Send className="h-4 w-4" />}
                          disabled={actionsDisabled}
                          onClick={() => setPendingSubmit(doc)}
                        >
                          {t('documents.submit')}
                        </Button>
                      )}
                      {canApproveDoc && (
                        <Button
                          size="sm"
                          icon={<CheckCircle2 className="h-4 w-4" />}
                          disabled={actionsDisabled}
                          onClick={() => setPendingApprove(doc)}
                        >
                          {t('documents.approve')}
                        </Button>
                      )}
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          icon={<Trash2 className="h-4 w-4" />}
                          disabled={actionsDisabled}
                          onClick={() => setPendingDelete(doc)}
                        >
                          {t('common.delete')}
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
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

      <DocumentFormDialog
        open={formOpen}
        onClose={saveReset}
        caseId={caseId}
        document={editing}
      />
      <DocumentViewDialog
        documentId={viewingId}
        onClose={() => setViewingId(null)}
        onEdit={openEdit}
      />

      <AiDraftDialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onConfirm={(kind) => aiM.mutate(kind)}
        working={aiM.isPending}
      />
      <ConfirmDialog
        open={pendingSubmit !== null}
        onClose={() => setPendingSubmit(null)}
        onConfirm={() => pendingSubmit && submitM.mutate(pendingSubmit.id)}
        title={t('documents.confirmSubmitTitle')}
        message={t('documents.confirmSubmit')}
        confirmLabel={t('documents.submit')}
        cancelLabel={t('common.cancel')}
        loading={submitM.isPending}
        tone="primary"
      />
      <ConfirmDialog
        open={pendingApprove !== null}
        onClose={() => setPendingApprove(null)}
        onConfirm={() => pendingApprove && approveM.mutate(pendingApprove.id)}
        title={t('documents.confirmApproveTitle')}
        message={t('documents.confirmApprove')}
        confirmLabel={t('documents.approve')}
        cancelLabel={t('common.cancel')}
        loading={approveM.isPending}
        tone="primary"
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
        title={t('documents.confirmDeleteTitle')}
        message={t('documents.confirmDelete')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}
