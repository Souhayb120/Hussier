import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from './AuthProvider'
import type { Role } from '../api/client'
import type { Capability } from '../features/auth/permissions'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '../components/ui'

/** Bloque l'accès si l'utilisateur n'est pas connecté. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

/** Bloque l'accès si le rôle de l'utilisateur n'est pas autorisé. */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { hasRole } = useAuth()
  const { t } = useTranslation()

  if (!hasRole(...roles)) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-6 w-6" />}
        title={t('errors.forbidden')}
      />
    )
  }
  return <>{children}</>
}

/** Affiche son contenu uniquement si l'utilisateur possède la capacité demandée. */
export function Can({
  capability,
  children,
}: {
  capability: Capability
  children: ReactNode
}) {
  const { can } = useAuth()
  return can(capability) ? <>{children}</> : null
}