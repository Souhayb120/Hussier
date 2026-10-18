import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Paperclip, X } from 'lucide-react'
import { api, type CaseResponse } from '../../api/client'
import { caseSchema, type CaseValues } from '../../lib/validators'
import { Button, Dialog, Field, Input, Textarea } from '../ui'
import { useToast } from '../Toast'
import { apiErrorKey, formatFileSize, toDateInput } from '../../lib/format'

const EMPTY: CaseValues = {
  clientName: '',
  clientIce: '',
  address: '',
  phone: '',
  subject: '',
  description: '',
  deadline: '',
}

/**
 * Levée lorsque le dossier a bien été créé mais que l'envoi des pièces jointes
 * a échoué : on referme le formulaire pour éviter de recréer un dossier en double.
 */
class AttachmentUploadError extends Error {
  caseId: string
  constructor(caseId: string) {
    super('attachment-upload-failed')
    this.name = 'AttachmentUploadError'
    this.caseId = caseId
  }
}

export function CaseFormDialog({
  open,
  onClose,
  caseItem,
}: {
  open: boolean
  onClose: () => void
  caseItem?: CaseResponse | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const editing = Boolean(caseItem)

  // Pièces jointes sélectionnées avant l'envoi — uniquement à la création.
  const [files, setFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CaseValues>({ resolver: zodResolver(caseSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    reset(
      caseItem
        ? {
            clientName: caseItem.clientName,
            clientIce: caseItem.clientIce ?? '',
            address: caseItem.address,
            phone: caseItem.phone ?? '',
            subject: caseItem.subject,
            description: caseItem.description ?? '',
            deadline: toDateInput(caseItem.deadline),
          }
        : EMPTY,
    )
    setFiles([])
  }, [open, caseItem, reset])

  // IMPORTANT : matérialiser immédiatement la FileList en tableau de File.
  // `input.files` est une liste « vivante » ; si on la convertit plus tard
  // (dans le updater de setState), elle est déjà vidée par `e.target.value = ''`
  // et les fichiers sélectionnés sont perdus.
  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const picked = Array.from(list)
    setFiles((prev) => [...prev, ...picked])
  }

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index))

  type SubmitPayload = { values: CaseValues; files: File[] }

  const mutation = useMutation({
    mutationFn: async ({ values, files: selected }: SubmitPayload) => {
      const payload = {
        clientName: values.clientName.trim(),
        clientIce: values.clientIce?.trim() || undefined,
        address: values.address.trim(),
        phone: values.phone?.trim() || undefined,
        subject: values.subject.trim(),
        description: values.description?.trim() || undefined,
        deadline: values.deadline,
      }
      if (caseItem) return api.cases.update(caseItem.id, payload)

      // 1) Le dossier doit exister avant tout envoi de pièce jointe.
      const created = await api.cases.create(payload)
      // 2) Envoi des fichiers sélectionnés (en parallèle), une requête par fichier.
      if (selected.length > 0) {
        try {
          await Promise.all(selected.map((file) => api.attachments.upload(created.id, file)))
        } catch {
          throw new AttachmentUploadError(created.id)
        }
      }
      return created
    },
    onSuccess: (data, { files: selected }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      if (caseItem) queryClient.invalidateQueries({ queryKey: ['case', caseItem.id] })
      else {
        queryClient.invalidateQueries({ queryKey: ['case', data.id] })
        if (selected.length > 0)
          queryClient.invalidateQueries({ queryKey: ['attachments', data.id] })
      }
      toast(editing ? t('cases.updated') : t('cases.created'))
      onClose()
    },
    onError: (error) => {
      // Le dossier est créé mais les pièces jointes ont échoué : on ne
      // recommence pas la création, on informe l'utilisateur.
      if (error instanceof AttachmentUploadError) {
        queryClient.invalidateQueries({ queryKey: ['cases'] })
        queryClient.invalidateQueries({ queryKey: ['attachments', error.caseId] })
        toast(t('attachments.uploadFailedAfterCreate'), 'error')
        onClose()
        return
      }
      toast(t(apiErrorKey(error)), 'error')
    },
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('cases.editTitle') : t('cases.newTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="case-form"
            loading={mutation.isPending}
          >
            {editing
              ? t('common.save')
              : mutation.isPending && files.length > 0
                ? t('attachments.uploading')
                : t('common.create')}
          </Button>
        </>
      }
    >
      <form
        id="case-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate({ values, files }))}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('cases.clientName')}
            required
            error={errors.clientName ? t(errors.clientName.message as string) : undefined}
          >
            <Input {...register('clientName')} />
          </Field>
          <Field
            label={t('cases.ice')}
            hint={t('cases.iceHint')}
            error={errors.clientIce ? t(errors.clientIce.message as string) : undefined}
          >
            <Input {...register('clientIce')} inputMode="numeric" />
          </Field>
        </div>

        <Field
          label={t('cases.address')}
          required
          error={errors.address ? t(errors.address.message as string) : undefined}
        >
          <Input {...register('address')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('cases.phone')}>
            <Input {...register('phone')} inputMode="tel" />
          </Field>
          <Field
            label={t('cases.deadlineLabel')}
            required
            error={errors.deadline ? t(errors.deadline.message as string) : undefined}
          >
            <Input type="date" {...register('deadline')} />
          </Field>
        </div>

        <Field
          label={t('cases.subject')}
          required
          error={errors.subject ? t(errors.subject.message as string) : undefined}
        >
          <Input {...register('subject')} />
        </Field>

        <Field label={t('cases.description')}>
          <Textarea {...register('description')} placeholder={t('cases.descriptionPlaceholder')} rows={3} />
        </Field>

        {/* Pièces jointes — disponibles à la création seulement (voir onglet
            « Pièces jointes » du dossier pour la consultation/suppression). */}
        {!editing && (
          <div className="space-y-2.5 border-t border-line pt-4">
            <Field label={t('attachments.selectFiles')} hint={t('attachments.selectFilesHint')}>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
                className="input cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
            </Field>

            {files.length > 0 && (
              <ul className="space-y-1.5">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-canvas/50 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Paperclip className="h-4 w-4 shrink-0 text-ink-soft" />
                      <span className="truncate text-sm text-ink">{file.name}</span>
                      <span className="shrink-0 text-xs tabnum text-ink-muted">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="rounded-md p-1 text-ink-soft transition hover:bg-canvas hover:text-red-600"
                      aria-label={t('attachments.removeFile')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </Dialog>
  )
}
