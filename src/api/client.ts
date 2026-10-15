/* =============================================================================
 * client.ts — Couche d'accès à l'API Mofawid (back-end Spring Boot).
 *
 * Toutes les routes exposées par le back-end sont regroupées ici :
 *   /api/auth, /api/cases, /api/documents, /api/missions,
 *   /api/missions/{id}/observations, /api/users, /api/tenants,
 *   /api/cases/{id}/tracking-code, /api/public/tracking/{code}
 *
 * Le proxy Vite (vite.config.ts) redirige /api vers le back-end Mofawid
 * (https://mofawid-backend.onrender.com, configurable via MOFAWID_API).
 * Pour pointer directement une URL absolue, définir VITE_API_URL.
 * ========================================================================== */

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'mofawid.token'

/* ------------------------------- Types ---------------------------------- */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ASSISTANT' | 'COLLABORATEUR'
export type CaseStatus =
  | 'QUALIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'CLOSED'
export type MissionStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ObservationKind = 'DIRECT' | 'DECLARATION' | 'UNVERIFIED'
export type DocumentKind =
  | 'PROCES_VERBAL'
  | 'RAPPORT'
  | 'MISE_EN_DEMEURE'
  | 'NOTIFICATION'
  | 'AUTRE'
export type DocumentStatus = 'DRAFT' | 'DRAFT_AI' | 'AWAITING_APPROVAL' | 'APPROVED'
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
}

export interface AuthResponse {
  token: string
}

export interface CaseResponse {
  id: string
  ref: string
  caseStatus: CaseStatus
  clientName: string
  clientIce: string | null
  address: string
  phone: string | null
  subject: string
  description: string | null
  deadline: string | null
  createdById: string | null
  createdByUsername: string | null
  createdAt: string
}

export interface CasePayload {
  clientName: string
  clientIce?: string
  address: string
  phone?: string
  subject: string
  description?: string
  deadline: string
}

export interface MissionResponse {
  id: string
  caseId: string
  caseRef: string
  assignedToId: string
  assignedToUsername: string
  assignedById: string
  assignedByUsername: string
  title: string
  description: string | null
  scheduledAt: string | null
  status: MissionStatus
  createdAt: string
}

export interface MissionPayload {
  caseId: string
  collaborateurId: string
  title: string
  description?: string
  scheduledAt?: string | null
}

export interface ObservationResponse {
  id: string
  missionId: string
  kind: ObservationKind
  description: string
  observedAt: string
}

export interface ObservationPayload {
  kind: ObservationKind
  description: string
}

export interface DocumentResponse {
  id: string
  caseId: string
  caseRef: string
  kind: DocumentKind
  status: DocumentStatus
  content: string | null
  createdAt: string
}

export interface DocumentPayload {
  kind: DocumentKind
  content?: string
}

export interface BillingResponse {
  id: string
  caseId: string
  caseRef: string
  totalAmount: number
  amountPaid: number
  remainingAmount: number
  status: PaymentStatus
  description: string | null
  createdAt: string
}

export interface BillingPayload {
  totalAmount: number
  amountPaid: number
  description?: string
}

/** POST /api/cases/{caseId}/tracking-code — code renvoyé une seule fois. */
export interface TrackingCodeResponse {
  caseRef: string
  trackingCode: string
}

/** GET /api/public/tracking/{code} — vue publique (client), sans données sensibles. */
export interface ClientTrackingResponse {
  caseRef: string
  progress: string
  reportReady: boolean
  totalAmount: number
  amountPaid: number
  remainingAmount: number
  paymentStatus: PaymentStatus | null
}

export interface UserResponse {
  id: string
  username: string
  email: string
  nom: string | null
  prenom: string | null
  phone: string | null
  active: boolean
  role: Role
  licenceNumber?: string | null
  createdAt?: string
}

export interface UserPayload {
  username: string
  email: string
  password?: string
  nom?: string
  prenom?: string
  phone?: string
  role: Role
  active?: boolean
}

export interface TenantAdminPayload {
  username: string
  email: string
  password: string
  nom?: string
  prenom?: string
  phone?: string
}

export interface TenantResponse {
  id: string
  name: string
  slug: string
  status: string
  adress: string | null
  phone: string | null
  createdAt: string
}

export interface TenantPayload {
  name: string
  slug: string
  status?: string
  adress?: string
  phone?: string
}

/* ----------------------------- Erreurs ---------------------------------- */

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/* --------------------------- Jeton d'accès ------------------------------ */

let token: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
})()

let onUnauthorized: (() => void) | null = null

export function getToken(): string | null {
  return token
}

export function setToken(next: string | null): void {
  token = next
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* noop */
  }
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

/** Décode la charge utile d'un JWT (sans vérifier la signature). */
export function decodeToken(value: string): { username: string; role: Role } | null {
  try {
    const payload = value.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    const data = JSON.parse(json) as { sub: string; role: string; exp?: number }
    if (data.exp && data.exp * 1000 <= Date.now()) return null
    const role = (data.role || '').replace('ROLE_', '') as Role
    return { username: data.sub, role }
  } catch {
    return null
  }
}

/* ---------------------------- Requête ----------------------------------- */

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(API_BASE + path, { ...options, headers })
  } catch {
    throw new ApiError(0, 'network')
  }

  if (res.status === 401) {
    onUnauthorized?.()
    throw new ApiError(401, 'unauthorized')
  }

  if (!res.ok) {
    throw new ApiError(res.status, await extractErrorMessage(res))
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text()
    if (!text) return ''
    try {
      const data = JSON.parse(text) as { message?: string; error?: string }
      return data.message || data.error || ''
    } catch {
      return text
    }
  } catch {
    return ''
  }
}

/* ---------------------------- Endpoints --------------------------------- */

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },

  cases: {
    list: (page = 0, size = 10) => request<Page<CaseResponse>>(`/cases?page=${page}&size=${size}`),
    get: (id: string) => request<CaseResponse>(`/cases/${id}`),
    create: (body: CasePayload) =>
      request<CaseResponse>('/cases', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: CasePayload) =>
      request<CaseResponse>(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/cases/${id}`, { method: 'DELETE' }),
  },

  billing: {
    get: (caseId: string) => request<BillingResponse>(`/cases/${caseId}/billing`),
    create: (caseId: string, body: BillingPayload) =>
      request<BillingResponse>(`/cases/${caseId}/billing`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (caseId: string, body: BillingPayload) =>
      request<BillingResponse>(`/cases/${caseId}/billing`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  tracking: {
    /** Réservé à ADMIN / ASSISTANT. Échoue si un code existe déjà (500). */
    generate: (caseId: string) =>
      request<TrackingCodeResponse>(`/cases/${caseId}/tracking-code`, { method: 'POST' }),
    /** Endpoint public : aucun jeton requis. */
    publicTrack: (code: string) =>
      request<ClientTrackingResponse>(`/public/tracking/${encodeURIComponent(code.trim())}`),
  },

  documents: {
    listByCase: (caseId: string, page = 0, size = 10) =>
      request<Page<DocumentResponse>>(`/cases/${caseId}/documents?page=${page}&size=${size}`),
    get: (id: string) => request<DocumentResponse>(`/documents/${id}`),
    create: (caseId: string, body: DocumentPayload) =>
      request<DocumentResponse>(`/cases/${caseId}/documents`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: DocumentPayload) =>
      request<DocumentResponse>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/documents/${id}`, { method: 'DELETE' }),
    generateAiDraft: (caseId: string) =>
      request<DocumentResponse>(`/cases/${caseId}/ai-draft`, { method: 'POST' }),
    submit: (id: string) =>
      request<DocumentResponse>(`/documents/${id}/submit`, { method: 'PATCH' }),
    approve: (id: string) =>
      request<DocumentResponse>(`/documents/${id}/approve`, { method: 'PATCH' }),
  },

  missions: {
    list: (page = 0, size = 10) => request<Page<MissionResponse>>(`/missions?page=${page}&size=${size}`),
    listMine: (page = 0, size = 10) =>
      request<Page<MissionResponse>>(`/missions/my?page=${page}&size=${size}`),
    get: (id: string) => request<MissionResponse>(`/missions/${id}`),
    create: (body: MissionPayload) =>
      request<MissionResponse>('/missions', { method: 'POST', body: JSON.stringify(body) }),
    start: (id: string) => request<MissionResponse>(`/missions/${id}/start`, { method: 'PATCH' }),
    complete: (id: string) => request<MissionResponse>(`/missions/${id}/complete`, { method: 'PATCH' }),
  },

  observations: {
    list: (missionId: string, page = 0, size = 20) =>
      request<Page<ObservationResponse>>(
        `/missions/${missionId}/observations?page=${page}&size=${size}`,
      ),
    create: (missionId: string, body: ObservationPayload) =>
      request<ObservationResponse>(`/missions/${missionId}/observations`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  users: {
    list: (page = 0, size = 10) => request<Page<UserResponse>>(`/users?page=${page}&size=${size}`),
    get: (id: string) => request<UserResponse>(`/users/${id}`),
    create: (body: UserPayload) =>
      request<UserResponse>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: UserPayload) =>
      request<UserResponse>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  },

  tenants: {
    list: (page = 0, size = 10) =>
      request<Page<TenantResponse>>(`/tenants?page=${page}&size=${size}`),
    get: (id: string) => request<TenantResponse>(`/tenants/${id}`),
    create: (body: TenantPayload) =>
      request<TenantResponse>('/tenants', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: TenantPayload) =>
      request<TenantResponse>(`/tenants/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/tenants/${id}`, { method: 'DELETE' }),
    createAdmin: (tenantId: string, body: TenantAdminPayload) =>
      request<UserResponse>(`/tenants/${tenantId}/admin`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
}
