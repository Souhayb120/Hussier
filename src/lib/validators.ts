import { z } from 'zod'

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
  phone: z.string().trim().optional().or(z.literal('')),
  subject: requiredString(),
  description: z.string().trim().optional().or(z.literal('')),
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
})

export const documentSchema = z.object({
  kind: z.enum(['PROCES_VERBAL', 'RAPPORT', 'MISE_EN_DEMEURE', 'NOTIFICATION', 'AUTRE']),
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
  status: z.string().trim().optional().or(z.literal('')),
  adress: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
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
export type DocumentValues = z.infer<typeof documentSchema>
export type BillingValues = z.infer<typeof billingSchema>
export type UserValues = z.infer<typeof userSchema>
export type TenantValues = z.infer<typeof tenantSchema>
export type TenantAdminValues = z.infer<typeof tenantAdminSchema>
