/* =============================================================================
 * client.ts — Couche d'accès à l'API Mofawid (back-end Spring Boot).
 *
 * Toutes les routes exposées par le back-end sont regroupées ici :
 *   /api/auth, /api/cases, /api/documents, /api/missions,
 *   /api/missions/{id}/observations, /api/users, /api/tenants,
 *   /api/cases/{id}/tracking-code, /api/public/tracking/{code},
 *   /api/cases/{id}/parties, /api/parties/{id}, /api/missions/{id}/attempts
 *
 * En développement, les requêtes /api passent par le proxy Vite
 * (vite.config.ts, cible lue dans MOFAWID_API).
 * En production, VITE_API_URL (.env.production) pointe vers l'URL absolue
 * du back-end déployé. Sans configuration, on garde la base relative /api.
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

/**
 * Types de documents — alignés sur l'énumération back-end
 * `com.example.mofawid.Enums.DocumentKind`.
 * Source unique pour les formulaires et la génération de brouillon IA.
 */
export const DOCUMENT_KINDS = [
  'NOTIFICATION',
  'NOTIFICATION_INFORMATIF',
  'NOTIFICATION_REFUS',
  'CONSTAT_LIEU',
  'CONSTAT_WHATSAPP',
  'CONSTAT_EMAIL',
  'CONSTAT_REUNION',
] as const

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

/** Types de notification : le bon type dépend du résultat de la dernière visite. */
export const NOTIFICATION_KINDS: readonly DocumentKind[] = [
  'NOTIFICATION',
  'NOTIFICATION_INFORMATIF',
  'NOTIFICATION_REFUS',
]

export type PartyRole = 'REQUESTER' | 'TARGET' | 'OTHER'
export type PartyType = 'PERSON' | 'COMPANY'

/** Résultat d'une visite de notification — aligné sur DeliveryResult (back-end). */
export const DELIVERY_RESULTS = [
  'DELIVERED_IN_PERSON',
  'DELIVERED_TO_OTHER',
  'REFUSED',
  'NOBODY_THERE',
  'ADDRESS_INCOMPLETE',
  'ADDRESS_NOT_FOUND',
  'MOVED',
] as const
export type DeliveryResult = (typeof DELIVERY_RESULTS)[number]
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

/**
 * Pièce jointe d'un dossier — POST /api/cases/{caseId}/attachments.
 * Aligné sur `AttachmentResponseDTO` (back-end).
 */
export interface AttachmentResponse {
  id: string
  originalName: string
  contentType: string
  size: number
  caption: string | null
  uploadedAt: string
  caseId: string
  /** Rempli quand le fichier a été ajouté par le collaborateur pendant une mission. */
  missionId: string | null
  uploadedById: string | null
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
  presentPersonName: string | null
  presentPersonCapacity: string | null
  status: MissionStatus
  createdAt: string
}

/** PATCH /api/missions/{id}/presence — personne présente lors du constat. */
export interface MissionPresencePayload {
  presentPersonName: string
  presentPersonCapacity: string
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
  sectionTitle: string | null
  observedAt: string
}

export interface ObservationPayload {
  kind: ObservationKind
  description: string
  /** Titre de la section dans le PV (« أولا: معاينة المصعد »). */
  sectionTitle?: string
}

export interface DocumentResponse {
  id: string
  caseId: string
  caseRef: string
  kind: DocumentKind
  status: DocumentStatus
  content: string | null
  createdAt: string
  approvedAt: string | null
  approvedByUsername: string | null
}

/** Partie citée dans le procès-verbal — /api/cases/{caseId}/parties. */
export interface PartyResponse {
  id: string
  caseId: string
  role: PartyRole
  type: PartyType
  fullName: string
  cin: string | null
  rc: string | null
  legalRepresentative: string | null
  address: string | null
  phone: string | null
  capacity: string | null
  createdAt: string
}

export interface PartyPayload {
  role: PartyRole
  type: PartyType
  fullName: string
  cin?: string
  rc?: string
  legalRepresentative?: string
  address?: string
  phone?: string
  capacity?: string
}

/** Visite de notification — /api/missions/{missionId}/attempts. */
export interface DeliveryAttemptResponse {
  id: string
  missionId: string
  attemptedAt: string
  result: DeliveryResult
  receiverName: string | null
  receiverCin: string | null
  receiverCapacity: string | null
  signed: boolean | null
  visitCardLeft: boolean | null
  notes: string | null
  createdAt: string
}

export interface DeliveryAttemptPayload {
  attemptedAt?: string
  result: DeliveryResult
  receiverName?: string
  receiverCin?: string
  receiverCapacity?: string
  signed?: boolean
  visitCardLeft?: boolean
  notes?: string
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
  huissierNameAr: string | null
  huissierNameFr: string | null
  appealCourtAr: string | null
  appealCourtFr: string | null
  firstInstanceCourtAr: string | null
  addressFr: string | null
  email: string | null
  city: string | null
  startNumber: number | null
  createdAt: string
}

/** Inclut l'en-tête des procès-verbaux (رأسية المحضر) et le 1er numéro du registre. */
export interface TenantPayload {
  name: string
  slug: string
  status?: string
  adress?: string
  phone?: string
  huissierNameAr?: string
  huissierNameFr?: string
  appealCourtAr?: string
  appealCourtFr?: string
  firstInstanceCourtAr?: string
  addressFr?: string
  email?: string
  city?: string
  startNumber?: number
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
  // Ne jamais forcer Content-Type sur un FormData : le navigateur doit
  // générer lui-même la frontière multipart (boundary).
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (options.body !== undefined && !isFormData) headers.set('Content-Type', 'application/json')
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

/**
 * Récupère un binaire (ex. pièce jointe) via une requête authentifiée.
 * On ne peut pas ouvrir directement l'URL dans un nouvel onglet : le jeton
 * d'accès vit dans l'en-tête Authorization, pas dans l'URL.
 */
async function requestBlob(path: string): Promise<Blob> {
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(API_BASE + path, { headers })
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

  return res.blob()
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
    /** Recherche côté serveur sur TOUS les dossiers de l'étude (réf., client, ICE, objet, adresse). */
    list: (page = 0, size = 10, search?: string, status?: CaseStatus) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) })
      if (search && search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      return request<Page<CaseResponse>>(`/cases?${params.toString()}`)
    },
    get: (id: string) => request<CaseResponse>(`/cases/${id}`),
    create: (body: CasePayload) =>
      request<CaseResponse>('/cases', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: CasePayload) =>
      request<CaseResponse>(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/cases/${id}`, { method: 'DELETE' }),
  },

  attachments: {
    listByCase: (caseId: string, page = 0, size = 20) =>
      request<Page<AttachmentResponse>>(
        `/cases/${caseId}/attachments?page=${page}&size=${size}`,
      ),
    /** Envoi multipart — le Content-Type est généré par le navigateur. */
    upload: (caseId: string, file: File, caption?: string) => {
      const body = new FormData()
      body.append('file', file)
      // Légende sous la photo dans le procès-verbal (« الصورة رقم 1 »).
      if (caption && caption.trim()) body.append('caption', caption.trim())
      return request<AttachmentResponse>(`/cases/${caseId}/attachments`, {
        method: 'POST',
        body,
      })
    },
    /** Fichiers ajoutés pendant une mission — GET /api/missions/{missionId}/attachments. */
    listByMission: (missionId: string, page = 0, size = 20) =>
      request<Page<AttachmentResponse>>(
        `/missions/${missionId}/attachments?page=${page}&size=${size}`,
      ),
    /** Collaborateur : ajout d'un fichier (tout type) à sa mission en cours ou terminée. */
    uploadToMission: (missionId: string, file: File, caption?: string) => {
      const body = new FormData()
      body.append('file', file)
      if (caption && caption.trim()) body.append('caption', caption.trim())
      return request<AttachmentResponse>(`/missions/${missionId}/attachments`, {
        method: 'POST',
        body,
      })
    },
    remove: (attachmentId: string) =>
      request<void>(`/attachments/${attachmentId}`, { method: 'DELETE' }),
    /**
     * Récupère le contenu du fichier en Blob (requête authentifiée).
     * `inline` sert à l'affichage (PDF/images) ; sinon téléchargement.
     */
    download: (attachmentId: string, inline = false) =>
      requestBlob(
        `/attachments/${attachmentId}/download${inline ? '?inline=true' : ''}`,
      ),
  },

  parties: {
    listByCase: (caseId: string) => request<PartyResponse[]>(`/cases/${caseId}/parties`),
    create: (caseId: string, body: PartyPayload) =>
      request<PartyResponse>(`/cases/${caseId}/parties`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: PartyPayload) =>
      request<PartyResponse>(`/parties/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/parties/${id}`, { method: 'DELETE' }),
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
    /** Réservé à ADMIN / ASSISTANT. Échoue si un code existe déjà (400). */
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
    /** `kind` est requis par le back-end (`?kind=...`) et fixe le type du brouillon. */
    generateAiDraft: (caseId: string, kind: DocumentKind) =>
      request<DocumentResponse>(
        `/cases/${caseId}/ai-draft?kind=${encodeURIComponent(kind)}`,
        { method: 'POST' },
      ),
    submit: (id: string) =>
      request<DocumentResponse>(`/documents/${id}/submit`, { method: 'PATCH' }),
    approve: (id: string) =>
      request<DocumentResponse>(`/documents/${id}/approve`, { method: 'PATCH' }),
  },

  missions: {
    list: (page = 0, size = 10) => request<Page<MissionResponse>>(`/missions?page=${page}&size=${size}`),
    listMine: (page = 0, size = 10) =>
      request<Page<MissionResponse>>(`/missions/my?page=${page}&size=${size}`),
    /** Toutes les missions d'un dossier — GET /api/missions/by-case/{caseId} (ADMIN). */
    listByCase: (caseId: string) => request<MissionResponse[]>(`/missions/by-case/${caseId}`),
    get: (id: string) => request<MissionResponse>(`/missions/${id}`),
    create: (body: MissionPayload) =>
      request<MissionResponse>('/missions', { method: 'POST', body: JSON.stringify(body) }),
    start: (id: string) => request<MissionResponse>(`/missions/${id}/start`, { method: 'PATCH' }),
    complete: (id: string) => request<MissionResponse>(`/missions/${id}/complete`, { method: 'PATCH' }),
    updatePresence: (id: string, body: MissionPresencePayload) =>
      request<MissionResponse>(`/missions/${id}/presence`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },

  attempts: {
    list: (missionId: string) =>
      request<DeliveryAttemptResponse[]>(`/missions/${missionId}/attempts`),
    create: (missionId: string, body: DeliveryAttemptPayload) =>
      request<DeliveryAttemptResponse>(`/missions/${missionId}/attempts`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
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
    /** Étude de l'utilisateur connecté (ADMIN / ASSISTANT). */
    me: () => request<TenantResponse>('/tenants/me'),
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
