/* OpenRouter's curated models — a plain module, so the server endpoint can allow exactly
 * these without importing the client's reactive LLM state.
 */

/**
 * Curated free OpenRouter models. The :free tier is upstream rate-limited
 * aggressively, so having several to fall back to is the practical fix.
 * The actual list rotates over time — refreshed against
 * https://openrouter.ai/api/v1/models. Quoted sizes are approximate.
 */
export const OPENROUTER_MODELS: Array<{ id: string; label: string; note?: string }> = [
	{
		id: 'openai/gpt-oss-20b:free',
		label: 'gpt-oss · 20B (free)',
		note: 'default · OpenAI open-weights, reliable JSON'
	},
	{
		id: 'openai/gpt-oss-120b:free',
		label: 'gpt-oss · 120B (free)',
		note: 'strongest open OAI · slower'
	},
	{
		id: 'qwen/qwen3-next-80b-a3b-instruct:free',
		label: 'Qwen3 · 80B (free)',
		note: 'good at structured output'
	},
	{
		id: 'meta-llama/llama-3.3-70b-instruct:free',
		label: 'Llama 3.3 · 70B (free)'
	},
	{
		id: 'meta-llama/llama-3.2-3b-instruct:free',
		label: 'Llama 3.2 · 3B (free)',
		note: 'fastest if available'
	},
	{
		id: 'google/gemma-4-26b-a4b-it:free',
		label: 'Gemma 4 · 26B (free)'
	},
	{
		id: 'deepseek/deepseek-v4-flash:free',
		label: 'DeepSeek v4 Flash (free)',
		note: 'fast'
	}
]

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS[0].id // openai/gpt-oss-20b:free
