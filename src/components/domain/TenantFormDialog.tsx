import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, type TenantResponse } from '../../api/client'
import { tenantSchema, type TenantValues } from '../../lib/validators'
import { Button, Dialog, Field, Input, Select } from '../ui'
import { useToast } from '../Toast'
import { apiErrorKey } from '../../lib/format'

const EMPTY: TenantValues = {
  name: '',
  slug: '',
  status: 'active',
  adress: '',
  phone: '',
}

export function TenantFormDialog({
  open,
  onClose,
  tenant,
}: {
  open: boolean
  onClose: () => void
  tenant?: TenantResponse | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const editing = Boolean(tenant)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantValues>({ resolver: zodResolver(tenantSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    reset(
      tenant
        ? {
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status || 'active',
            adress: tenant.adress ?? '',
            phone: tenant.phone ?? '',
          }
        : EMPTY,
    )
  }, [open, tenant, reset])

  const mutation = useMutation({
    mutationFn: (values: TenantValues) => {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        status: values.status?.trim() || undefined,
        adress: values.adress?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      }
      return tenant ? api.tenants.update(tenant.id, payload) : api.tenants.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast(editing ? t('tenants.updated') : t('tenants.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('tenants.editTitle') : t('tenants.newTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="tenant-form" loading={mutation.isPending}>
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <form
        id="tenant-form"
        className="space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('tenants.name')}
            required
            error={errors.name ? t(errors.name.message as string) : undefined}
          >
            <Input {...register('name')} placeholder={t('tenants.namePlaceholder')} />
          </Field>
          <Field
            label={t('tenants.slug')}
            required
            hint={t('tenants.slugHint')}
            error={errors.slug ? t(errors.slug.message as string) : undefined}
          >
            <Input {...register('slug')} placeholder="cabinet-rabat" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('tenants.status')}
            error={errors.status ? t(errors.status.message as string) : undefined}
          >
            <Select {...register('status')}>
              <option value="active">{t('tenants.active')}</option>
              <option value="inactive">{t('tenants.inactive')}</option>
            </Select>
          </Field>
          <Field label={t('tenants.phone')} error={errors.phone ? t(errors.phone.message as string) : undefined}>
            <Input {...register('phone')} inputMode="tel" />
          </Field>
        </div>

        <Field
          label={t('tenants.address')}
          error={errors.adress ? t(errors.adress.message as string) : undefined}
        >
          <Input {...register('adress')} />
        </Field>
      </form>
    </Dialog>
  )
}