import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, type CaseResponse } from '../../api/client'
import { caseSchema, type CaseValues } from '../../lib/validators'
import { Button, Dialog, Field, Input, Textarea } from '../ui'
import { useToast } from '../Toast'
import { apiErrorKey, toDateInput } from '../../lib/format'

const EMPTY: CaseValues = {
  clientName: '',
  clientIce: '',
  address: '',
  phone: '',
  subject: '',
  description: '',
  deadline: '',
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
  }, [open, caseItem, reset])

  const mutation = useMutation({
    mutationFn: (values: CaseValues) => {
      const payload = {
        clientName: values.clientName.trim(),
        clientIce: values.clientIce?.trim() || undefined,
        address: values.address.trim(),
        phone: values.phone?.trim() || undefined,
        subject: values.subject.trim(),
        description: values.description?.trim() || undefined,
        deadline: values.deadline,
      }
      return caseItem ? api.cases.update(caseItem.id, payload) : api.cases.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      if (caseItem) queryClient.invalidateQueries({ queryKey: ['case', caseItem.id] })
      toast(editing ? t('cases.updated') : t('cases.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
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
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <form id="case-form" className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
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
      </form>
    </Dialog>
  )
}
