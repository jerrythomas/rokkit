/**
 * LLM routing with two providers:
 *
 * 1. OpenRouter (default) — hosted free-tier models (Llama, Gemma) via a
 *    SvelteKit server endpoint that holds the API key. No download, fast
 *    first response, but needs network + the server's OPENROUTER_API_KEY
 *    env var.
 * 2. Web-LLM (opt-in fallback) — @mlc-ai/web-llm runs the model entirely
 *    in the browser (WebGPU). No API key, no network after the initial
 *    ~1–2 GB download cached locally.
 *
 * On OpenRouter failure (no key, rate limit, network) we surface a
 * suggestion to switch to web-llm. Both providers emit the same Block[]
 * shape so the chat UI doesn't care which one was used.
 */
import type { Block } from './types'
import { buildSystemPrompt, parseCompletion } from './parse'

export type LLMProvider = 'openrouter' | 'webllm'
export type LLMStatus = 'uninitialized' | 'loading' | 'ready' | 'thinking' | 'error'

// ─── OpenRouter free-tier models ───────────────────────────────────────

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

// ─── Web-LLM models (opt-in download) ──────────────────────────────────

export const WEBLLM_MODELS: Array<{ id: string; label: string; size: string; note?: string }> = [
	{
		id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
		label: 'Llama 3.2 · 1B',
		size: '~700 MB',
		note: 'fastest; weaker tool-calling'
	},
	{
		id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
		label: 'Llama 3.2 · 3B',
		size: '~2 GB',
		note: 'best balance'
	},
	{
		id: 'Hermes-3-Llama-3.2-3B-q4f32_1-MLC',
		label: 'Hermes 3 · 3B',
		size: '~2 GB',
		note: 'tool-calling tuned'
	},
	{
		id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
		label: 'Qwen 2.5 · 1.5B',
		size: '~1 GB'
	}
]

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS[0].id // openai/gpt-oss-20b:free
export const DEFAULT_WEBLLM_MODEL = WEBLLM_MODELS[1].id

export const llm = $state<{
	provider: LLMProvider
	enabled: boolean
	openRouterModel: string
	webllmModel: string
	webllmStatus: LLMStatus
	webllmProgress: number
	webllmStage: string
	errorMessage: string
	webgpuSupported: boolean | null
}>({
	provider: 'openrouter',
	enabled: false,
	openRouterModel: DEFAULT_OPENROUTER_MODEL,
	webllmModel: DEFAULT_WEBLLM_MODEL,
	webllmStatus: 'uninitialized',
	webllmProgress: 0,
	webllmStage: '',
	errorMessage: '',
	webgpuSupported: null
})

/**
 * Point the engine at a route mode + optional model. Simulated disables the
 * LLM (scripted router); openrouter/webllm enable it and set the model
 * (falling back to the mode default). Called by the /chat/[mode] page.
 */
export function setEngine(mode: 'simulated' | 'openrouter' | 'webllm', model?: string): void {
	if (mode === 'simulated') {
		llm.enabled = false
		return
	}
	llm.enabled = true
	if (mode === 'webllm') {
		llm.provider = 'webllm'
		llm.webllmModel = model ?? DEFAULT_WEBLLM_MODEL
	} else {
		llm.provider = 'openrouter'
		llm.openRouterModel = model ?? DEFAULT_OPENROUTER_MODEL
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let webllmEngine: any = null

export function detectWebGPU(): boolean {
	if (typeof navigator === 'undefined') return false
	const supported = typeof (navigator as { gpu?: unknown }).gpu !== 'undefined'
	llm.webgpuSupported = supported
	return supported
}

// ─── OpenRouter provider (default) ─────────────────────────────────────

const OPENROUTER_TIMEOUT_MS = 90_000

async function routeViaOpenRouter(query: string): Promise<Block[]> {
	// Free-tier providers can take 20–60 s for the first token; the browser's
	// implicit fetch timeout otherwise surfaces as a generic "Failed to fetch"
	// with no signal. Bound the wait explicitly so we can show a clear timeout
	// message and the user knows to switch model/provider.
	const ctrl = new AbortController()
	const timer = setTimeout(() => ctrl.abort(), OPENROUTER_TIMEOUT_MS)
	try {
		const res = await fetch('/api/llm/openrouter', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: llm.openRouterModel,
				messages: [
					{ role: 'system', content: buildSystemPrompt() },
					{ role: 'user', content: query }
				],
				temperature: 0.3
			}),
			signal: ctrl.signal
		})
		if (!res.ok) {
			const text = await res.text()
			throw new Error(`${res.status} · ${text.slice(0, 200)}`)
		}
		return parseCompletion(await res.json())
	} catch (err) {
		// AbortError → our timeout fired. Normalise it to a status-tagged error
		// so the caller's "<status> · ..." matcher can render a clean message.
		if ((err as Error).name === 'AbortError') {
			throw new Error(`408 · timed out after ${OPENROUTER_TIMEOUT_MS / 1000}s — the free-tier provider didn't respond in time`)
		}
		throw err
	} finally {
		clearTimeout(timer)
	}
}

// ─── Web-LLM provider (opt-in download) ────────────────────────────────

export async function ensureWebLLMEngine() {
	if (webllmEngine) return webllmEngine
	if (!detectWebGPU()) {
		llm.webllmStatus = 'error'
		llm.errorMessage = 'WebGPU is not available in this browser.'
		return null
	}
	llm.webllmStatus = 'loading'
	llm.webllmProgress = 0
	llm.webllmStage = 'Initialising web-llm…'
	try {
		// CDN import: Vite's regex-based dependency scanner can't handle the
		// npm bundle (Maximum call stack). The CDN URL is opaque to Vite so
		// the browser fetches it directly.
		const mod = await import(
			/* @vite-ignore */ 'https://esm.run/@mlc-ai/web-llm@0.2.83'
		)
		webllmEngine = await mod.CreateMLCEngine(llm.webllmModel, {
			initProgressCallback: (p: { progress: number; text: string }) => {
				llm.webllmProgress = p.progress
				llm.webllmStage = p.text
			}
		})
		llm.webllmStatus = 'ready'
		llm.webllmProgress = 1
		llm.webllmStage = 'Ready'
		return webllmEngine
	} catch (e) {
		llm.webllmStatus = 'error'
		llm.errorMessage = (e as Error).message || String(e)
		return null
	}
}

export function resetWebLLMEngine() {
	webllmEngine = null
	llm.webllmStatus = 'uninitialized'
	llm.webllmProgress = 0
	llm.webllmStage = ''
	llm.errorMessage = ''
}

async function routeViaWebLLM(query: string): Promise<Block[]> {
	const e = await ensureWebLLMEngine()
	if (!e) {
		return [
			{
				kind: 'error',
				title: 'Web-LLM unavailable',
				message: llm.errorMessage || 'Unknown initialisation error.',
				hint: 'Switch back to OpenRouter, or check that this browser has WebGPU enabled.'
			}
		]
	}
	llm.webllmStatus = 'thinking'
	try {
		// No tools/tool_choice here — most free web-llm models (Llama-3.2-3B,
		// Phi, etc.) don't implement function-calling and Web-LLM rejects the
		// request outright. The system prompt instructs the model to emit
		// markdown fences (plot/table/form/list/stepper); the same parser
		// path as OpenRouter picks them up.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any = await e.chat.completions.create({
			messages: [
				{ role: 'system', content: buildSystemPrompt() },
				{ role: 'user', content: query }
			],
			temperature: 0.3
		})
		return parseCompletion(result)
	} catch (err) {
		const msg = (err as Error).message || String(err)
		return [
			{
				kind: 'error',
				title: 'Web-LLM request failed',
				...formatErrorDetail(msg)
			}
		]
	} finally {
		llm.webllmStatus = 'ready'
	}
}

// ─── Public entry point ────────────────────────────────────────────────

type OpenRouterStatusMeta = { title: (model: string) => string; hint: string }

const OPENROUTER_STATUS_META: Record<string, OpenRouterStatusMeta> = {
	'429': {
		title: () => 'Rate-limited by the free provider',
		hint: 'Try a different free model, retry in a moment, or switch to Web-LLM (one-time browser download).'
	},
	'404': {
		title: (model) => `Model unavailable (${model})`,
		hint: 'Pick another model from the dropdown — the free model list rotates.'
	},
	'408': {
		title: () => 'OpenRouter timed out',
		hint: 'Free-tier latency varies. Retry, pick a smaller/faster model, or switch to Web-LLM.'
	},
	'503': {
		title: () => 'OpenRouter unreachable',
		hint: 'Switch to Web-LLM if this keeps failing, or retry.'
	}
}

function formatErrorDetail(detail: string): { message: string; details?: string } {
	if (detail.length <= 240) return { message: detail }
	return { message: `${detail.slice(0, 240)}…`, details: detail }
}

/**
 * Parse a raw OpenRouter error message ("<status> · <detail>", as formed by
 * routeViaOpenRouter) into the { title, detail, hint } tuple routeViaLLM
 * surfaces. Unknown statuses fall back to a generic message; a status-less
 * error means the request failed before it reached OpenRouter.
 */
function describeOpenRouterError(raw: string): { title: string; detail: string; hint: string } {
	const match = raw.match(/^(\d{3})\s+·\s+(.+)$/s)
	const status = match ? match[1] : ''
	const detail = match ? match[2] : raw
	const meta = OPENROUTER_STATUS_META[status]
	return {
		title: meta ? meta.title(llm.openRouterModel) : status ? `OpenRouter ${status}` : 'OpenRouter request failed',
		detail,
		hint: meta?.hint ?? 'Switch to Web-LLM if this keeps failing, or retry.'
	}
}

/**
 * Route a query through whichever provider is currently selected. On
 * OpenRouter failure, surfaces a "switch to web-llm" suggestion so the
 * user can fall back without typing.
 */
export async function routeViaLLM(query: string): Promise<Block[]> {
	if (llm.provider === 'openrouter') {
		try {
			return await routeViaOpenRouter(query)
		} catch (err) {
			const raw = (err as Error).message || String(err)
			const { title, detail, hint } = describeOpenRouterError(raw)
			return [
				{
					kind: 'error',
					title,
					...formatErrorDetail(detail),
					hint
				},
				{
					kind: 'suggestions',
					intro: 'Or',
					items: [
						{
							label: 'Switch to Web-LLM (downloads ~2 GB)',
							query: '__switch_to_webllm',
							action: { kind: 'switch-provider', provider: 'webllm' }
						},
						{ label: 'Retry', query }
					]
				}
			]
		}
	}
	return routeViaWebLLM(query)
}
