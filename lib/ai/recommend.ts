import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { recommendationOutputSchema, type RecommendationOutput } from '@/lib/validation/schemas'

// Données envoyées au modèle : aucun identifiant (pas de nom, pas d'email, pas d'id).
export type RecommendationInput = {
  age: number
  risk_tolerance: 'cautious' | 'balanced' | 'dynamic'
  assets: { label: string; amount: number }[]
  income: { source: string; amount: number }[]
  previous_allocations: { actions: number; obligations: number; liquidites: number }[]
}

// Le nom du modèle est de la configuration, pas de la logique (Review #4) :
// il se change dans les variables d'environnement Vercel, sans modifier le code.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5'

// Raison d'un échec, enregistrée en base (colonne error_reason, migration 0004).
// Une catégorie courte : jamais le message brut de l'API, qui n'a rien à faire à l'écran.
export type FailureReason = 'config' | 'rate_limit' | 'api' | 'invalid_output'

export class GenerationError extends Error {
  constructor(public reason: FailureReason, message: string) {
    super(message)
  }
}

function reasonFromApiError(e: unknown): FailureReason {
  if (e instanceof Anthropic.APIError) {
    // 401 clé invalide, 403 accès refusé, 404 modèle inconnu : réglage du déploiement
    if (e.status === 401 || e.status === 403 || e.status === 404) return 'config'
    if (e.status === 429) return 'rate_limit'
  }
  return 'api' // panne, surcharge (529), réseau…
}

// Politique de conformité (Design Rev. 3, §5.5).
const SYSTEM = `You help a financial advisor draft an indicative asset allocation for one client.
You receive the client's age, risk tolerance, current assets, income and previous allocations.

Reply with ONLY a JSON object, no markdown, in exactly this shape:
{"allocation":{"actions":<int>,"obligations":<int>,"liquidites":<int>},"explanation":"<text>"}

Rules:
- actions = equities, obligations = bonds, liquidites = cash. Whole numbers from 0 to 100 that add up to exactly 100.
- The explanation is in English, 2 to 4 sentences, under 600 characters, and refers to the client's age, risk tolerance and current holdings.
- Present the allocation as an indicative simulation. Never give definitive or binding advice and never name specific securities, funds or tickers.`

export async function draftRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let message: Anthropic.Message
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(input) }],
    })
  } catch (e) {
    throw new GenerationError(reasonFromApiError(e), e instanceof Error ? e.message : String(e))
  }

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

  // Le modèle doit renvoyer du JSON pur ; on tolère du texte autour des accolades.
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new GenerationError('invalid_output', 'No JSON object in model output')
  }

  // La forme ou les valeurs ne respectent pas le contrat : 'invalid_output'.
  let raw: unknown
  try {
    raw = JSON.parse(text.slice(start, end + 1))
  } catch {
    throw new GenerationError('invalid_output', 'Model output is not valid JSON')
  }
  const parsed = recommendationOutputSchema.safeParse(raw)
  if (!parsed.success) {
    throw new GenerationError('invalid_output', parsed.error.issues[0]?.message ?? 'Invalid output')
  }
  return parsed.data
}
