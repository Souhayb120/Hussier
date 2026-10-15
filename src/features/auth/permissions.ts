/* =============================================================================
 * permissions.ts — Matrice de permissions centralisée.
 *
 * Une seule source de vérité pour savoir qui peut faire quoi dans l'interface.
 * Le back-end reste l'autorité : si un appel échoue avec 403, c'est le back-end
 * qui décide. Cette matrice sert uniquement à masquer/désactiver les actions.
 * ========================================================================== */

import type { Role } from '../../api/client'

export type Capability =
  | 'dashboard:view'
  | 'cases:view'
  | 'cases:create'
  | 'cases:edit'
  | 'cases:delete'
  | 'missions:view' // voir toutes les missions de l'étude
  | 'missions:create' // créer une mission et l'assigner
  | 'missions:work' // collaborateur : démarrer / observer / terminer ses missions
  | 'documents:prepare' // créer, éditer, générer un brouillon IA, soumettre
  | 'documents:approve' // approuver (verrouille le document, clôture le dossier)
  | 'documents:delete'
  | 'billing:manage' // consulter, créer et mettre à jour la facturation d'un dossier
  | 'tracking:manage' // générer le code de suivi client d'un dossier
  | 'users:manage'
  | 'tenants:manage'

const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  SUPER_ADMIN: ['tenants:manage'],
  ADMIN: [
    'dashboard:view',
    'cases:view',
    'cases:create',
    'cases:edit',
    'cases:delete',
    'missions:view',
    'missions:create',
    'documents:prepare',
    'documents:approve',
    'documents:delete',
    'billing:manage',
    'tracking:manage',
    'users:manage',
  ],
  ASSISTANT: [
    'dashboard:view',
    'cases:view',
    'cases:create',
    'cases:edit',
    'documents:prepare',
    'billing:manage',
    'tracking:manage',
  ],
  COLLABORATEUR: ['missions:work'],
}

export function can(role: Role | null | undefined, capability: Capability): boolean {
  return !!role && ROLE_CAPABILITIES[role].includes(capability)
}