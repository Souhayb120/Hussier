import { z } from 'zod'
import { DELIVERY_RESULTS, DOCUMENT_KINDS } from '../api/client'

/* Schémas partagés — les messages sont des clés i18n (« validation.* »). */

const requiredString = (key = 'validation.required') =>
  z.string().trim().min(1, { message: key })

export const loginSchema = z.object({
  username: requiredString(),
  password: z.string().min(6, { message: 'validation.min6' }),
})

export const caseSchema = z.object({
  clientName: requiredString(),
  clientIce: z.string().trim().optional().or(z.literal('')),
  address: requiredString(),
  phone: requiredString(), // @NotBlank côté back-end
  subject: requiredString(),
  description: requiredString(), // @NotBlank : texte de la demande, cité dans le PV
  deadline: requiredString('validation.date'),
})

export const missionSchema = z.object({
  caseId: requiredString(),
  collaborateurId: requiredString(),
  title: requiredString(),
  description: z.string().trim().optional().or(z.literal('')),
  scheduledAt: z.string().trim().optional().or(z.literal('')),
})

export const observationSchema = z.object({
  kind: z.enum(['DIRECT', 'DECLARATION', 'UNVERIFIED']),
  description: requiredString(),
  sectionTitle: z.string().trim().optional().or(z.literal('')),
})

/* Partie citée dans le PV : une société doit avoir son RC ou son représentant légal (même règle que le back-end). */
export const partySchema = z
  .object({
    role: z.enum(['REQUESTER', 'TARGET', 'OTHER']),
    type: z.enum(['PERSON', 'COMPANY']),
    fullName: requiredString(),
    cin: z.string().trim().optional().or(z.literal('')),
    rc: z.string().trim().optional().or(z.literal('')),
    legalRepresentative: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
    capacity: z.string().trim().optional().or(z.literal('')),
  })
  .refine((v) => v.type !== 'COMPANY' || Boolean(v.rc?.trim() || v.legalRepresentative?.trim()), {
    message: 'parties.companyNeedsRc',
    path: ['rc'],
  })

/* Visite de notification : mêmes règles que le back-end (nom / qualité de la personne rencontrée). */
export const attemptSchema = z
  .object({
    attemptedAt: z.string().trim().optional().or(z.literal('')),
    result: z.enum(DELIVERY_RESULTS),
    receiverName: z.string().trim().optional().or(z.literal('')),
    receiverCin: z.string().trim().optional().or(z.literal('')),
    receiverCapacity: z.string().trim().optional().or(z.literal('')),
    signed: z.boolean().optional(),
    visitCardLeft: z.boolean().optional(),
    notes: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (v) =>
      (v.result !== 'DELIVERED_TO_OTHER' && v.result !== 'REFUSED') ||
      Boolean(v.receiverName?.trim()),
    { message: 'attempts.receiverRequired', path: ['receiverName'] },
  )
  .refine((v) => v.result !== 'DELIVERED_TO_OTHER' || Boolean(v.receiverCapacity?.trim()), {
    message: 'attempts.capacityRequired',
    path: ['receiverCapacity'],
  })

export const presenceSchema = z.object({
  presentPersonName: requiredString(),
  presentPersonCapacity: requiredString(),
})

export const documentSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS),
  content: z.string().trim().optional().or(z.literal('')),
})

const positiveAmount = (key: string) =>
  z.coerce
    .number({ invalid_type_error: 'validation.number' })
    .min(0, { message: key })

export const billingSchema = z
  .object({
    totalAmount: positiveAmount('validation.positive'),
    amountPaid: positiveAmount('validation.positive'),
    description: z.string().trim().optional().or(z.literal('')),
  })
  .refine((values) => values.amountPaid <= values.totalAmount, {
    message: 'validation.paidExceedsTotal',
    path: ['amountPaid'],
  })

export const userSchema = z.object({
  username: requiredString(),
  email: z.string().trim().min(1, { message: 'validation.required' }).email({ message: 'validation.email' }),
  password: z.string().min(6, { message: 'validation.min6' }).optional().or(z.literal('')),
  nom: z.string().trim().optional().or(z.literal('')),
  prenom: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  role: z.enum(['ASSISTANT', 'COLLABORATEUR']),
  active: z.boolean().optional(),
})

export const tenantSchema = z.object({
  name: requiredString(),
  slug: requiredString(),
  // @NotBlank côté back-end
  status: requiredString(),
  adress: requiredString(),
  phone: requiredString(),
  // En-tête des procès-verbaux
  huissierNameAr: z.string().trim().optional().or(z.literal('')),
  huissierNameFr: z.string().trim().optional().or(z.literal('')),
  appealCourtAr: z.string().trim().optional().or(z.literal('')),
  appealCourtFr: z.string().trim().optional().or(z.literal('')),
  firstInstanceCourtAr: z.string().trim().optional().or(z.literal('')),
  addressFr: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email({ message: 'validation.email' }).optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  // Premier numéro du registre (vide = 1)
  startNumber: z
    .string()
    .trim()
    .regex(/^\d*$/, { message: 'validation.number' })
    .optional(),
})

export const tenantAdminSchema = z.object({
  username: requiredString(),
  email: z.string().trim().min(1, { message: 'validation.required' }).email({ message: 'validation.email' }),
  password: z.string().min(6, { message: 'validation.min6' }),
  nom: z.string().trim().optional().or(z.literal('')),
  prenom: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
})

export type LoginValues = z.infer<typeof loginSchema>
export type CaseValues = z.infer<typeof caseSchema>
export type MissionValues = z.infer<typeof missionSchema>
export type ObservationValues = z.infer<typeof observationSchema>
export type PartyValues = z.infer<typeof partySchema>
export type AttemptValues = z.infer<typeof attemptSchema>
export type PresenceValues = z.infer<typeof presenceSchema>
export type DocumentValues = z.infer<typeof documentSchema>
export type BillingValues = z.infer<typeof billingSchema>
export type UserValues = z.infer<typeof userSchema>
export type TenantValues = z.infer<typeof tenantSchema>
export type TenantAdminValues = z.infer<typeof tenantAdminSchema>
