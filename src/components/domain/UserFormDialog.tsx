import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, type UserResponse } from '../../api/client'
import { userSchema, type UserValues } from '../../lib/validators'
import { Button, Dialog, Field, Input, Select } from '../ui'
import { useToast } from '../Toast'
import { apiErrorKey } from '../../lib/format'

const EMPTY: UserValues = {
  username: '',
  email: '',
  password: '',
  nom: '',
  prenom: '',
  phone: '',
  role: 'ASSISTANT',
  active: true,
}

export function UserFormDialog({
  open,
  onClose,
  userItem,
}: {
  open: boolean
  onClose: () => void
  userItem?: UserResponse | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const editing = Boolean(userItem)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserValues>({ resolver: zodResolver(userSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open) return
    reset(
      userItem
        ? {
            username: userItem.username,
            email: userItem.email,
            password: '',
            nom: userItem.nom ?? '',
            prenom: userItem.prenom ?? '',
            phone: userItem.phone ?? '',
            role: userItem.role as UserValues['role'],
            active: userItem.active ?? true,
          }
        : EMPTY,
    )
  }, [open, userItem, reset])

  const mutation = useMutation({
    mutationFn: (values: UserValues) => {
      if (editing) {
        return api.users.update(userItem!.id, {
          username: values.username.trim(),
          email: values.email.trim(),
          nom: values.nom?.trim() || undefined,
          prenom: values.prenom?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          role: values.role,
          active: values.active ?? true,
        })
      }
      return api.users.create({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        nom: values.nom?.trim() || undefined,
        prenom: values.prenom?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        role: values.role,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast(editing ? t('users.updated') : t('users.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const onSubmit = (values: UserValues) => {
    if (!editing && (!values.password || values.password.length === 0)) {
      setError('password', { message: 'validation.required' })
      return
    }
    mutation.mutate(values)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('users.editTitle') : t('users.newTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="user-form" loading={mutation.isPending}>
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <form id="user-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('users.firstName')} error={errors.prenom ? t(errors.prenom.message as string) : undefined}>
            <Input {...register('prenom')} />
          </Field>
          <Field label={t('users.lastName')} error={errors.nom ? t(errors.nom.message as string) : undefined}>
            <Input {...register('nom')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('users.phone')} error={errors.phone ? t(errors.phone.message as string) : undefined}>
            <Input {...register('phone')} inputMode="tel" />
          </Field>
          <Field
            label={t('users.role')}
            required
            hint={t('users.onlyAssistantCollab')}
            error={errors.role ? t(errors.role.message as string) : undefined}
          >
            <Select {...register('role')}>
              <option value="ASSISTANT">{t('roles.ASSISTANT')}</option>
              <option value="COLLABORATEUR">{t('roles.COLLABORATEUR')}</option>
            </Select>
          </Field>
        </div>

        <Field
          label={t('users.password')}
          required={!editing}
          hint={editing ? t('users.passwordKeepHint') : t('users.passwordHint')}
          error={errors.password ? t(errors.password.message as string) : undefined}
        >
          <Input type="password" {...register('password')} autoComplete="new-password" />
        </Field>

        {editing && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas/50 px-4 py-3">
            <input
              type="checkbox"
              {...register('active')}
              className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-ink">{t('users.status')}</span>
            <span className="ms-auto text-sm text-ink-muted">
              {t('users.active')} / {t('users.inactive')}
            </span>
          </label>
        )}
      </form>
    </Dialog>
  )
}