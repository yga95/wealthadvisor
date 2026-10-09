import { z } from 'zod'

// Mêmes règles que les CHECK de la base (Design Rev. 3, §4) :
// le formulaire, l'action serveur et la base partagent une seule définition.

export type ActionState = { error?: string } | undefined

const uuid = z.string().uuid()
const amount = z.coerce
  .number()
  .min(0, 'Amount must be 0 or more')
  .max(999_999_999_999.99, 'Amount is too large')

export const assetSchema = z.object({
  owner_id: uuid,
  label: z.string().trim().min(1, 'Label is required').max(100, 'Label: 100 characters max'),
  amount,
})

export const incomeSchema = z.object({
  owner_id: uuid,
  source: z.string().trim().min(1, 'Source is required').max(100, 'Source: 100 characters max'),
  amount,
})

export const rowSchema = z.object({ id: uuid, owner_id: uuid })

export const noteSchema = z.object({
  client_id: uuid,
  content: z.string().trim().min(1, 'The note is empty').max(2000, 'Note: 2000 characters max'),
})

export const noteDeleteSchema = z.object({ id: uuid, client_id: uuid })

export const profileSchema = z.object({
  client_id: uuid,
  age: z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().int('Age must be a whole number')
      .min(18, 'Age must be between 18 and 120')
      .max(120, 'Age must be between 18 and 120')
      .nullable(),
  ),
  risk_tolerance: z.enum(['cautious', 'balanced', 'dynamic']),
})

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid data'
}

// ---- Admin ----
export const adminUpdateSchema = z.object({
  id: uuid,
  role: z.enum(['admin', 'advisor', 'client']),
  advisor_id: z.preprocess((v) => (v === '' || v == null ? null : v), uuid.nullable()),
})

export const createUserSchema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(120, 'Name: 120 characters max'),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(8, 'Password: 8 characters minimum'),
})

export const userIdSchema = z.object({ id: uuid })

// ---- Recommandations IA (Design Rev. 3, §5.4) ----
export const generateSchema = z.object({ client_id: uuid })
export const archiveSchema = z.object({ id: uuid, client_id: uuid })

// Sortie du modèle : mêmes règles que la base (0-100, somme 100, explication ≤ 4000).
// Tout écart => status 'failed', jamais une erreur de base de données.
const pct = z.number().int().min(0).max(100)
export const recommendationOutputSchema = z
  .object({
    allocation: z.object({ actions: pct, obligations: pct, liquidites: pct }),
    explanation: z.string().trim().min(1).max(4000),
    disclaimer: z.string().trim().min(1).max(300),
  })
  .refine(
    (o) => o.allocation.actions + o.allocation.obligations + o.allocation.liquidites === 100,
    { message: 'Allocation must sum to 100' },
  )
export type RecommendationOutput = z.infer<typeof recommendationOutputSchema>
