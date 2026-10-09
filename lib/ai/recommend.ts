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

const MODEL = 'claude-haiku-5-5'

// Politique de conformité (Design Rev. 3, §5.5).
const SYSTEM = `You help a financial advisor draft an indicative asset allocation for one client.
You receive the client's age, risk tolerance, current assets, income and previous allocations.

Reply with ONLY a JSON object, no markdown, in exactly this shape:
{"allocation":{"actions":<int>,"obligations":<int>,"liquidites":<int>},"explanation":"<text>","disclaimer":"<text>"}

Rules:
- actions = equities, obligations = bonds, liquidites = cash. Whole numbers from 0 to 100 that add up to exactly 100.
- The explanation is in English, 2 to 4 sentences, under 600 characters, and refers to the client's age, risk tolerance and current holdings.
- Present the allocation as an indicative simulation. Never give definitive or binding advice and never name specific securities, funds or tickers.
- The disclaimer says that this is an indicative simulation and not regulated financial advice.`

export async function draftRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: 'user', content: JSON.stringify(input) }],
  })

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

  // Le modèle doit renvoyer du JSON pur ; on tolère du texte autour des accolades.
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON object in model output')

  // Lève une erreur si la forme ou les valeurs ne respectent pas le contrat.
  return recommendationOutputSchema.parse(JSON.parse(text.slice(start, end + 1)))
}
