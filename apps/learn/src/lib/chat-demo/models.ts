/* OpenRouter's curated models — a plain module, so the server endpoint can allow exactly
 * these without importing the client's reactive LLM state.
 */

/**
 * Curated free OpenRouter models. The :free tier is upstream rate-limited
 * aggressively, so having several to fall back to is the practical fix.
 * The actual list rotates over time — refreshed against
 * https://openrouter.ai/api/v1/models (last 2026-10-02), keeping only free
 * models whose `supported_parameters` include `response_format`, since the
 * demo sends json_object. Quoted sizes are approximate.
 */
export const OPENROUTER_MODELS: Array<{ id: string; label: string; note?: string }> = [
	{
		id: 'nvidia/nemotron-3-super-120b-a12b:free',
		label: 'Nemotron 3 Super · 120B (free)',
		note: 'default · strongest, reliable JSON'
	},
	{
		id: 'google/gemma-4-26b-a4b-it:free',
		label: 'Gemma 4 · 26B (free)',
		note: 'MoE, ~4B active · often rate-limited'
	},
	{
		id: 'google/gemma-4-31b-it:free',
		label: 'Gemma 4 · 31B (free)',
		note: 'dense · steadier answers'
	},
	{
		id: 'dots-studio/dots-3-note-preview:free',
		label: 'Dots3-Note · 280B (free)',
		note: 'preview'
	},
	{
		id: 'liquid/lfm-2.5-2.6b:free',
		label: 'LFM 2.5 · 2.6B (free)',
		note: 'fastest if available'
	}
]

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS[0].id // nvidia/nemotron-3-super-120b-a12b:free

const CURATED = new Set(OPENROUTER_MODELS.map((m) => m.id))

/** A listed model as-is; anything else (a stale `?model=`, a saved conversation) → the default. */
export function curatedOpenRouterModel(id: string | undefined): string {
	return id && CURATED.has(id) ? id : DEFAULT_OPENROUTER_MODEL
}
