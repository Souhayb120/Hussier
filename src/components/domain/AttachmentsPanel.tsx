import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Download, Eye, Paperclip, Trash2, Upload, X } from 'lucide-react'
import { api, type AttachmentResponse } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { useToast } from '../Toast'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Pagination,
  Skeleton,
} from '../ui'
import { apiErrorKey, formatFileSize, useFormatters } from '../../lib/format'

/** Types affichables directement dans un onglet du navigateur. */
function isViewable(contentType: string): boolean {
  const type = (contentType || '').toLowerCase()
  return type === 'application/pdf' || type.startsWith('image/')
}

/** Ouvre un Blob dans un nouvel onglet à partir d'une URL objet (jeton requis). */
function openBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  // On libère l'URL après un délai pour laisser l'onglet la charger.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Force le téléchargement d'un Blob sous son nom d'origine. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'attachment'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/* --------------------------- Liste pièces jointes ------------------------ */

export function AttachmentsPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const canManage = can('attachments:manage')

  const [page, setPage] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<AttachmentResponse | null>(null)
  // Fichiers sélectionnés pour être ajoutés au dossier existant.
  const [newFiles, setNewFiles] = useState<File[]>([])
  // Légende de chaque fichier (même index que newFiles) — « الصورة رقم 1: … » dans le PV.
  const [newCaptions, setNewCaptions] = useState<string[]>([])

  const listQ = useQuery({
    queryKey: ['attachments', caseId, { page }],
    queryFn: () => api.attachments.listByCase(caseId, page, 20),
  })

  const viewM = useMutation({
    mutationFn: (file: AttachmentResponse) => api.attachments.download(file.id, true),
    onSuccess: (blob) => openBlob(blob),
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const downloadM = useMutation({
    mutationFn: (file: AttachmentResponse) => api.attachments.download(file.id, false),
    onSuccess: (blob, file) => saveBlob(blob, file.originalName),
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => api.attachments.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', caseId] })
      toast(t('attachments.deleted'))
      setPendingDelete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  // IMPORTANT : `input.files` est une liste « vivante ». On la convertit
  // immédiatement en tableau de File avant de vider l'input, sinon les
  // fichiers sélectionnés sont perdus.
  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const picked = Array.from(list)
    setNewFiles((prev) => [...prev, ...picked])
    setNewCaptions((prev) => [...prev, ...picked.map(() => '')])
  }

  const clearNewFiles = () => {
    setNewFiles([])
    setNewCaptions([])
  }

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewCaptions((prev) => prev.filter((_, i) => i !== index))
  }

  const changeCaption = (index: number, value: string) =>
    setNewCaptions((prev) => prev.map((c, i) => (i === index ? value : c)))

  const uploadM = useMutation({
    // Une requête POST /cases/{caseId}/attachments par fichier, l'une après l'autre :
    // le PV numérote les photos dans l'ordre d'envoi (الصورة رقم 1، 2…).
    mutationFn: async (selected: File[]) => {
      const results: PromiseSettledResult<AttachmentResponse>[] = []
      for (let i = 0; i < selected.length; i++) {
        try {
          const value = await api.attachments.upload(caseId, selected[i], newCaptions[i])
          results.push({ status: 'fulfilled', value })
        } catch (reason) {
          results.push({ status: 'rejected', reason })
        }
      }
      return results
    },
    onSuccess: (results) => {
      // Rafraîchissement automatique de la liste dans tous les cas
      // (certains fichiers ont pu être acceptés avant l'échec).
      queryClient.invalidateQueries({ queryKey: ['attachments', caseId] })
      if (!results.some((r) => r.status === 'rejected')) {
        toast(t('attachments.created'))
        clearNewFiles()
        return
      }
      // On ne garde en attente que les fichiers réellement refusés.
      setNewFiles((prev) => prev.filter((_, i) => results[i]?.status === 'rejected'))
      setNewCaptions((prev) => prev.filter((_, i) => results[i]?.status === 'rejected'))
      toast(t('attachments.uploadFailed'), 'error')
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', caseId] })
      toast(t(apiErrorKey(error)), 'error')
    },
  })

  const items = listQ.data?.content ?? []
  const total = listQ.data?.totalElements ?? 0
  const busy = viewM.isPending || downloadM.isPending || deleteM.isPending

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t('attachments.title')}</h2>
          <p className="text-sm text-ink-muted">{t('attachments.count', { count: total })}</p>
        </div>
      </div>

      {canManage && (
        <Card className="p-4">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (newFiles.length > 0 && !uploadM.isPending) uploadM.mutate(newFiles)
            }}
          >
            <Field label={t('attachments.addTitle')} hint={t('attachments.addHint')}>
              <input
                type="file"
                multiple
                disabled={uploadM.isPending}
                onChange={(event) => {
                  addFiles(event.target.files)
                  event.target.value = ''
                }}
                className="input cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
            </Field>

            {newFiles.length > 0 && (
              <ul className="space-y-1.5">
                {newFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-canvas/50 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Paperclip className="h-4 w-4 shrink-0 text-ink-soft" />
                      <span className="truncate text-sm text-ink">{file.name}</span>
                      <span className="shrink-0 text-xs tabnum text-ink-muted">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Input
                      className="min-w-[12rem] flex-1"
                      dir="auto"
                      value={newCaptions[index] ?? ''}
                      disabled={uploadM.isPending}
                      onChange={(event) => changeCaption(index, event.target.value)}
                      placeholder={t('attachments.captionPlaceholder')}
                      aria-label={t('attachments.caption')}
                    />
                    <button
                      type="button"
                      disabled={uploadM.isPending}
                      onClick={() => removeNewFile(index)}
                      className="rounded-md p-1 text-ink-soft transition hover:bg-canvas hover:text-red-600"
                      aria-label={t('attachments.removeFile')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end gap-2">
              {newFiles.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploadM.isPending}
                  onClick={clearNewFiles}
                >
                  {t('common.cancel')}
                </Button>
              )}
              <Button
                type="submit"
                icon={<Upload className="h-4 w-4" />}
                loading={uploadM.isPending}
                disabled={newFiles.length === 0}
              >
                {uploadM.isPending ? t('attachments.uploading') : t('attachments.upload')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
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
            icon={<Paperclip className="h-6 w-6" />}
            title={t('attachments.empty')}
            description={t('attachments.emptyHint')}
          />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 p-5 transition hover:bg-canvas/50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Paperclip className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{file.originalName}</p>
                    {file.caption && (
                      <p className="truncate text-sm text-ink-muted" dir="auto">
                        {file.caption}
                      </p>
                    )}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
                      <span>{file.contentType || t('common.none')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabnum">{formatFileSize(file.size)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{fmt.dateTime(file.uploadedAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {isViewable(file.contentType) && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                      disabled={busy}
                      onClick={() => viewM.mutate(file)}
                    >
                      {t('common.view')}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    disabled={busy}
                    onClick={() => downloadM.mutate(file)}
                  >
                    {t('attachments.download')}
                  </Button>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      icon={<Trash2 className="h-4 w-4" />}
                      disabled={busy}
                      onClick={() => setPendingDelete(file)}
                    >
                      {t('common.delete')}
                    </Button>
                  )}
                </div>
              </li>
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

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
        title={t('attachments.confirmDeleteTitle')}
        message={t('attachments.confirmDelete', { name: pendingDelete?.originalName ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}
