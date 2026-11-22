import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { KeyRound, Save } from 'lucide-react'
import { api, ApiError, type UserResponse } from '../api/client'
import { useToast } from '../components/Toast'
import { Badge, Button, Card, EmptyState, Field, Input, Skeleton } from '../components/ui'
import { PageHeader } from '../components/layout'
import { apiErrorKey, useFormatters } from '../lib/format'
import { initials } from '../lib/utils'
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeValues,
  type ProfileValues,
} from '../lib/validators'

/**
 * Page « Mon profil » : chaque utilisateur (tous les rôles) voit ses informations,
 * modifie son nom, son e-mail et son téléphone, et change son mot de passe.
 * Identifiant, rôle et statut restent gérés par l'administrateur.
 */
export default function ProfilePage() {
  const { t } = useTranslation()

  const query = useQuery({ queryKey: ['me'], queryFn: api.users.me })

  return (
    <div>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      {query.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2" aria-busy="true">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : query.isError || !query.data ? (
        <Card>
          <EmptyState
            title={t('errors.loadFailed')}
            description={t(apiErrorKey(query.error))}
            action={
              <Button variant="outline" onClick={() => query.refetch()}>
                {t('common.retry')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <ProfileCard profile={query.data} />
          <PasswordCard />
        </div>
      )}
    </div>
  )
}

/* ------------------------- Informations + édition ------------------------- */

function ProfileCard({ profile }: { profile: UserResponse }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const fmt = useFormatters()
  const queryClient = useQueryClient()

  const toValues = (p: UserResponse): ProfileValues => ({
    email: p.email ?? '',
    nom: p.nom ?? '',
    prenom: p.prenom ?? '',
    phone: p.phone ?? '',
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: toValues(profile) })

  const saveM = useMutation({
    mutationFn: (values: ProfileValues) => api.users.updateMe(values),
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
      // la liste « Utilisateurs » de l'admin montre aussi ces informations
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reset(toValues(updated))
      toast(t('profile.saved'))
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 400 && /email/i.test(error.message)) {
        setError('email', { message: 'profile.emailTaken' }, { shouldFocus: true })
      } else {
        toast(t(apiErrorKey(error)), 'error')
      }
    },
  })

  const fullName = [profile.prenom, profile.nom].filter(Boolean).join(' ') || profile.username

  return (
    <Card className="p-5 sm:p-6">
      {/* En-tête : qui je suis (lecture seule) */}
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-lg font-semibold text-white"
        >
          {initials(fullName)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-ink" title={fullName}>
            {fullName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{t(`roles.${profile.role}`)}</Badge>
            {profile.tenantName && (
              <span className="truncate text-sm text-ink-muted" title={profile.tenantName}>
                {profile.tenantName}
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-line bg-canvas/60 p-4 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">{t('users.username')}</dt>
          <dd className="truncate font-medium text-ink">
            <span dir="ltr">{profile.username}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">{t('users.role')}</dt>
          <dd className="font-medium text-ink">{t(`roles.${profile.role}`)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">{t('profile.office')}</dt>
          <dd className="font-medium text-ink [overflow-wrap:anywhere]">
            {profile.tenantName ?? t('profile.noOffice')}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-muted">{t('users.memberSince')}</dt>
          <dd className="font-medium text-ink">{profile.createdAt ? fmt.date(profile.createdAt) : '—'}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-ink-muted">{t('profile.adminManaged')}</p>

      {/* Ce que l'utilisateur peut modifier */}
      <form
        className="mt-6 space-y-4 border-t border-line pt-5"
        onSubmit={handleSubmit((values) => saveM.mutate(values))}
        noValidate
      >
        <h3 className="text-base font-semibold text-ink">{t('profile.infoTitle')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('users.firstName')} error={errors.prenom ? t(errors.prenom.message as string) : undefined}>
            <Input {...register('prenom')} autoComplete="given-name" />
          </Field>
          <Field label={t('users.lastName')} error={errors.nom ? t(errors.nom.message as string) : undefined}>
            <Input {...register('nom')} autoComplete="family-name" />
          </Field>
        </div>
        <Field label={t('users.email')} required error={errors.email ? t(errors.email.message as string) : undefined}>
          <Input type="email" {...register('email')} autoComplete="email" dir="ltr" />
        </Field>
        <Field label={t('users.phone')} error={errors.phone ? t(errors.phone.message as string) : undefined}>
          <Input type="tel" {...register('phone')} autoComplete="tel" inputMode="tel" dir="ltr" />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" icon={<Save className="h-4 w-4" />} loading={saveM.isPending} disabled={!isDirty}>
            {t('profile.save')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/* ------------------------------ Mot de passe ------------------------------ */

const EMPTY_PASSWORDS: PasswordChangeValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

function PasswordCard() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordChangeValues>({ resolver: zodResolver(passwordChangeSchema), defaultValues: EMPTY_PASSWORDS })

  const passwordM = useMutation({
    mutationFn: (values: PasswordChangeValues) =>
      api.users.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      reset(EMPTY_PASSWORDS)
      toast(t('profile.passwordChanged'))
    },
    onError: (error) => {
      // 400 : le back-end dit ce qui ne va pas ; on l'affiche sous le bon champ
      const message = error instanceof ApiError && error.status === 400 ? error.message : ''
      if (/current password/i.test(message)) {
        setError('currentPassword', { message: 'profile.wrongPassword' }, { shouldFocus: true })
      } else if (/different/i.test(message)) {
        setError('newPassword', { message: 'profile.samePassword' }, { shouldFocus: true })
      } else {
        toast(t(apiErrorKey(error)), 'error')
      }
    },
  })

  const errorOf = (key: keyof PasswordChangeValues) =>
    errors[key] ? t(errors[key]?.message as string) : undefined

  return (
    <Card className="p-5 sm:p-6">
      <form className="space-y-4" onSubmit={handleSubmit((values) => passwordM.mutate(values))} noValidate>
        <div>
          <h2 className="text-base font-semibold text-ink">{t('profile.passwordTitle')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('profile.passwordHint')}</p>
        </div>
        <Field label={t('profile.currentPassword')} required error={errorOf('currentPassword')}>
          <Input type="password" {...register('currentPassword')} autoComplete="current-password" dir="ltr" />
        </Field>
        <Field label={t('profile.newPassword')} required error={errorOf('newPassword')} hint={t('validation.min8')}>
          <Input type="password" {...register('newPassword')} autoComplete="new-password" dir="ltr" />
        </Field>
        <Field label={t('profile.confirmPassword')} required error={errorOf('confirmPassword')}>
          <Input type="password" {...register('confirmPassword')} autoComplete="new-password" dir="ltr" />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="outline" icon={<KeyRound className="h-4 w-4" />} loading={passwordM.isPending}>
            {t('profile.changePassword')}
          </Button>
        </div>
      </form>
    </Card>
  )
}
