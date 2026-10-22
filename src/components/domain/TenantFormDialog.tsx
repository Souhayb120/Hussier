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
  huissierNameAr: '',
  huissierNameFr: '',
  appealCourtAr: '',
  appealCourtFr: '',
  firstInstanceCourtAr: '',
  addressFr: '',
  email: '',
  city: '',
  startNumber: '',
}

/** Chaîne vide → undefined (le back-end garde alors la valeur nulle). */
const clean = (value?: string) => value?.trim() || undefined

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
            huissierNameAr: tenant.huissierNameAr ?? '',
            huissierNameFr: tenant.huissierNameFr ?? '',
            appealCourtAr: tenant.appealCourtAr ?? '',
            appealCourtFr: tenant.appealCourtFr ?? '',
            firstInstanceCourtAr: tenant.firstInstanceCourtAr ?? '',
            addressFr: tenant.addressFr ?? '',
            email: tenant.email ?? '',
            city: tenant.city ?? '',
            startNumber: tenant.startNumber != null ? String(tenant.startNumber) : '',
          }
        : EMPTY,
    )
  }, [open, tenant, reset])

  const mutation = useMutation({
    mutationFn: (values: TenantValues) => {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        status: clean(values.status),
        adress: clean(values.adress),
        phone: clean(values.phone),
        huissierNameAr: clean(values.huissierNameAr),
        huissierNameFr: clean(values.huissierNameFr),
        appealCourtAr: clean(values.appealCourtAr),
        appealCourtFr: clean(values.appealCourtFr),
        firstInstanceCourtAr: clean(values.firstInstanceCourtAr),
        addressFr: clean(values.addressFr),
        email: clean(values.email),
        city: clean(values.city),
        startNumber: values.startNumber?.trim() ? Number(values.startNumber) : undefined,
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

  const err = (key: keyof TenantValues) =>
    errors[key] ? t(errors[key]?.message as string) : undefined

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
          <Field label={t('tenants.name')} required error={err('name')}>
            <Input {...register('name')} placeholder={t('tenants.namePlaceholder')} />
          </Field>
          <Field label={t('tenants.slug')} required hint={t('tenants.slugHint')} error={err('slug')}>
            <Input {...register('slug')} placeholder="cabinet-rabat" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('tenants.status')} required error={err('status')}>
            <Select {...register('status')}>
              <option value="active">{t('tenants.active')}</option>
              <option value="inactive">{t('tenants.inactive')}</option>
            </Select>
          </Field>
          <Field label={t('tenants.phone')} required error={err('phone')}>
            <Input {...register('phone')} inputMode="tel" />
          </Field>
        </div>

        <Field label={t('tenants.address')} required error={err('adress')}>
          <Input {...register('adress')} dir="auto" />
        </Field>

        {/* En-tête des procès-verbaux (رأسية المحضر) */}
        <div className="border-t border-line pt-4">
          <h3 className="text-sm font-semibold text-ink">{t('tenants.letterhead')}</h3>
          <p className="text-xs text-ink-muted">{t('tenants.letterheadHint')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('tenants.huissierNameAr')} error={err('huissierNameAr')}>
            <Input {...register('huissierNameAr')} dir="rtl" placeholder="عبد الغني أشرع" />
          </Field>
          <Field label={t('tenants.huissierNameFr')} error={err('huissierNameFr')}>
            <Input {...register('huissierNameFr')} dir="ltr" placeholder="ACHRAY ABDELGHANI" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('tenants.appealCourtAr')} error={err('appealCourtAr')}>
            <Input
              {...register('appealCourtAr')}
              dir="rtl"
              placeholder={t('tenants.appealCourtArPlaceholder')}
            />
          </Field>
          <Field label={t('tenants.appealCourtFr')} error={err('appealCourtFr')}>
            <Input
              {...register('appealCourtFr')}
              dir="ltr"
              placeholder={t('tenants.appealCourtFrPlaceholder')}
            />
          </Field>
        </div>

        <Field label={t('tenants.firstInstanceCourtAr')} error={err('firstInstanceCourtAr')}>
          <Input
            {...register('firstInstanceCourtAr')}
            dir="rtl"
            placeholder={t('tenants.firstInstanceCourtArPlaceholder')}
          />
        </Field>

        <Field label={t('tenants.addressFr')} error={err('addressFr')}>
          <Input {...register('addressFr')} dir="ltr" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t('tenants.city')} error={err('city')}>
            <Input {...register('city')} dir="auto" />
          </Field>
          <Field label={t('tenants.email')} error={err('email')}>
            <Input {...register('email')} type="email" dir="ltr" />
          </Field>
          <Field
            label={t('tenants.startNumber')}
            hint={t('tenants.startNumberHint')}
            error={err('startNumber')}
          >
            <Input {...register('startNumber')} inputMode="numeric" placeholder="2282" />
          </Field>
        </div>
      </form>
    </Dialog>
  )
}
