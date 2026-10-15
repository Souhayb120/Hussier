import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { api, type TenantResponse } from '../../api/client'
import { tenantAdminSchema, type TenantAdminValues } from '../../lib/validators'
import { Button, Dialog, Field, Input } from '../ui'
import { useToast } from '../Toast'
import { apiErrorKey } from '../../lib/format'

const EMPTY: TenantAdminValues = {
  username: '',
  email: '',
  password: '',
  nom: '',
  prenom: '',
  phone: '',
}

export function TenantAdminDialog({
  open,
  onClose,
  tenant,
}: {
  open: boolean
  onClose: () => void
  tenant: TenantResponse | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantAdminValues>({
    resolver: zodResolver(tenantAdminSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (open) reset(EMPTY)
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (values: TenantAdminValues) =>
      api.tenants.createAdmin(tenant!.id, {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        nom: values.nom?.trim() || undefined,
        prenom: values.prenom?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast(t('tenants.adminCreated'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('tenants.adminTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="tenant-admin-form" loading={mutation.isPending}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p className="text-sm text-brand-800">
          {t('tenants.adminHint', { name: tenant?.name ?? '' })}
        </p>
      </div>

      <form
        id="tenant-admin-form"
        className="space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('users.username')}
            required
            error={errors.username ? t(errors.username.message as string) : undefined}
          >
            <Input {...register('username')} autoComplete="off" />
          </Field>
          <Field
            label={t('users.email')}
            required
            error={errors.email ? t(errors.email.message as string) : undefined}
          >
            <Input type="email" {...register('email')} autoComplete="off" />
          </Field>
        </div>

        <Field
          label={t('users.password')}
          required
          hint={t('users.passwordHint')}
          error={errors.password ? t(errors.password.message as string) : undefined}
        >
          <Input type="password" {...register('password')} autoComplete="new-password" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('users.firstName')} error={errors.prenom ? t(errors.prenom.message as string) : undefined}>
            <Input {...register('prenom')} />
          </Field>
          <Field label={t('users.lastName')} error={errors.nom ? t(errors.nom.message as string) : undefined}>
            <Input {...register('nom')} />
          </Field>
        </div>

        <Field label={t('users.phone')} error={errors.phone ? t(errors.phone.message as string) : undefined}>
          <Input {...register('phone')} inputMode="tel" />
        </Field>
      </form>
    </Dialog>
  )
}