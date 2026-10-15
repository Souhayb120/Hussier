import type { Role } from '../api/client'

/**
 * Page d'accueil par rôle — une seule source de vérité pour le « home ».
 * SUPER_ADMIN → plateforme ; COLLABORATEUR → mes missions ; sinon tableau de bord.
 */
export function homeFor(role: Role | null | undefined): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/platform/offices'
    case 'COLLABORATEUR':
      return '/mes-missions'
    default:
      return '/dashboard'
  }
}