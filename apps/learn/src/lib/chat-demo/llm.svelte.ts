/**
 * The chat's engine state: which LLM provider (if any) interprets a message, its model, and
 * the in-browser Web-LLM engine.
 *
 * 1. OpenRouter — a curated free model, asked by the server (`/api/chat/interpret`) to classify
 *    a message; the key stays server-side.
 * 2. Web-LLM — @mlc-ai/web-llm runs the same classifier prompt in the browser (WebGPU). No key,
 *    no network after the one-time ~1–2 GB download.
 *
 * Both only interpret; the chat acts on their reading like any other (intent/). If either fails,
 * the local interpreter answers and the reply says why.
 */
import { DEFAULT_OPENROUTER_MODEL, curatedOpenRouterModel } from './models'
import type { Backend } from './intent/interpret'

export type LLMProvider = 'openrouter' | 'webllm'
export type LLMStatus = 'uninitialized' | 'loading' | 'ready' | 'thinking' | 'error'

export { OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODEL } from './models'

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

export const DEFAULT_WEBLLM_MODEL = WEBLLM_MODELS[1].id

export const llm = $state<{
	provider: LLMProvider
	enabled: boolean
	/** Who interprets a message when no LLM is enabled: the browser, or System One on the server. */
	interpreter: Backend
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
	interpreter: 'local',
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
 * LLM (the local interpreter answers); openrouter/webllm enable it and set the model
 * (falling back to the mode default). Called by the /chat/[mode] page.
 */
export function setEngine(mode: 'simulated' | 'systemone' | 'openrouter' | 'webllm', model?: string): void {
	// Simulated and System One have no LLM; they differ only in who interprets a message.
	llm.interpreter = mode === 'systemone' ? 'systemone' : 'local'
	if (mode === 'simulated' || mode === 'systemone') {
		llm.enabled = false
		return
	}
	llm.enabled = true
	if (mode === 'webllm') {
		llm.provider = 'webllm'
		llm.webllmModel = model ?? DEFAULT_WEBLLM_MODEL
	} else {
		llm.provider = 'openrouter'
		llm.openRouterModel = curatedOpenRouterModel(model)
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

/**
 * Run the classifier messages on the in-browser engine — loading it on first use — and resolve
 * with the reply text. Throws when the engine cannot run, so the caller falls back.
 */
export async function completeWithWebLLM(messages: { role: string; content: string }[]): Promise<string> {
	const engine = await ensureWebLLMEngine()
	if (!engine) throw new Error(llm.errorMessage || 'Web-LLM could not start')
	llm.webllmStatus = 'thinking'
	try {
		// No response_format: not every web-llm model takes json_object, and the parser finds the
		// object in prose anyway.
		const result = await engine.chat.completions.create({ messages, temperature: 0 })
		return result.choices?.[0]?.message?.content ?? ''
	} finally {
		llm.webllmStatus = 'ready'
	}
}
