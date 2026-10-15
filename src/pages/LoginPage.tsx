import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  Bot,
  Eye,
  EyeOff,
  FileSearch,
  Lock,
  Scale,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { loginSchema, type LoginValues } from '../lib/validators'
import { useAuth } from '../auth/AuthProvider'
import { Button, Field, Input } from '../components/ui'
import { GeometricPattern } from '../components/GeometricPattern'
import { cn } from '../lib/utils'

const DEMO_ACCOUNTS: Array<{ username: string; password: string; role: string }> = [
  { username: 'superadmin', password: 'Admin@123', role: 'SUPER_ADMIN' },
  { username: 'admin.demo', password: 'Admin@123', role: 'ADMIN' },
  { username: 'assistant.demo', password: 'Assist@123', role: 'ASSISTANT' },
  { username: 'collab.ahmed', password: 'Ahmed@123', role: 'COLLABORATEUR' },
]

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })
  const [loginError, setLoginError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.username.trim(), values.password)
      navigate(from, { replace: true })
    } catch {
      setLoginError('auth.error')
    }
  }

  const features = [
    { icon: FileSearch, label: t('auth.feature1') },
    { icon: Bot, label: t('auth.feature2') },
    { icon: Users, label: t('auth.feature3') },
  ]

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      {/* Panneau de marque */}
      <div className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <GeometricPattern className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.05]" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Scale className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight">{t('app.name')}</p>
            <p className="text-sm text-white/70">{t('app.tagline')}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-snug">{t('auth.heroTitle')}</h1>
          <p className="mt-4 text-white/75">{t('auth.heroText')}</p>

          <div className="mt-8 h-px w-24 bg-gold-400/60" aria-hidden="true" />

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <feature.icon className="h-5 w-5" />
                </span>
                <span className="text-sm text-white/90">{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="h-4 w-4" />
          {t('auth.footer')}
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-800 text-white">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold tracking-tight text-ink">{t('app.name')}</p>
              <p className="text-2xs text-ink-muted">{t('app.tagline')}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink">{t('auth.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('auth.subtitle')}</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field
              label={t('auth.username')}
              required
              error={errors.username ? t(errors.username.message as string) : undefined}
            >
              <div className="relative">
                <UserRound className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-soft" />
                <Input
                  {...register('username')}
                  autoComplete="username"
                  placeholder={t('auth.usernamePlaceholder')}
                  className="ps-9"
                />
              </div>
            </Field>

            <Field
              label={t('auth.password')}
              required
              error={errors.password ? t(errors.password.message as string) : undefined}
            >
              <div className="relative">
                <Lock className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-soft" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  className="ps-9 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  className="absolute inset-y-0 end-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-ink-soft transition hover:bg-canvas hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {loginError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200"
              >
                {t(loginError)}
              </p>
            )}

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {t('auth.demoTitle')}
            </p>
            <p className="mt-1 text-2xs text-ink-muted">{t('auth.demoHint')}</p>
            <div className="mt-3 grid gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => reset({ username: account.username, password: account.password })}
                  className={cn(
                    'flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2.5 text-start text-sm transition',
                    'hover:border-brand-300 hover:bg-brand-50/50',
                  )}
                >
                  <span className="font-medium text-ink tabnum">{account.username}</span>
                  <span className="text-xs text-ink-muted">{t(`roles.${account.role}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}