/**
 * Phase 2: in-browser LLM routing via @mlc-ai/web-llm.
 *
 * The model runs entirely in the browser (WebGPU) — no API key, no token
 * cost, no server round-trip after the initial ~600 MB-1 GB model
 * download. The downloaded weights are cached in the browser's
 * OPFS/IndexedDB after the first load.
 *
 * This module is intentionally a 1-for-1 replacement for `routeQuery` in
 * the mock router. The Block[] shape coming out matches what the mock
 * produces, so the rest of the chat UI doesn't change.
 *
 * The user has to explicitly opt-in (click "Load model") because the
 * download is large and WebGPU isn't guaranteed to be present. The store
 * still defaults to the mock router; the page toggles which one is used.
 */
import type { Block } from './types'
import { catalog } from '$lib/koan/catalog'

export type LLMStatus = 'uninitialized' | 'loading' | 'ready' | 'thinking' | 'error'

export const DEFAULT_MODEL = 'Llama-3.2-3B-Instruct-q4f32_1-MLC'

/**
 * Curated model list. All quantized to fit comfortably in browser memory.
 * Tool-calling fidelity is the main driver of the picks here — sub-3B
 * models often degrade significantly on multi-tool selection.
 */
export const AVAILABLE_MODELS: Array<{ id: string; label: string; size: string; note?: string }> = [
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
		note: 'best balance of speed + accuracy'
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

export const llm = $state<{
	status: LLMStatus
	modelId: string
	loadProgress: number
	loadStage: string
	errorMessage: string
	webgpuSupported: boolean | null
}>({
	status: 'uninitialized',
	modelId: DEFAULT_MODEL,
	loadProgress: 0,
	loadStage: '',
	errorMessage: '',
	webgpuSupported: null
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let engine: any = null

/**
 * Test for WebGPU availability without importing web-llm (so we can grey
 * out the LLM toggle before the user opts in).
 */
export function detectWebGPU(): boolean {
	if (typeof navigator === 'undefined') return false
	if (typeof (navigator as { gpu?: unknown }).gpu === 'undefined') {
		llm.webgpuSupported = false
		return false
	}
	llm.webgpuSupported = true
	return true
}

/**
 * Build the OpenAI-compatible `tools` list from the catalog. Each demo's
 * `tool: DemoTool` becomes a function declaration. The parameters
 * schema is intentionally loose for now — most demos document param
 * shapes in prose; we lift those into JSON Schema as we tighten them.
 */
export function buildToolSpecs() {
	return catalog
		.filter((m) => m.tool)
		.map((m) => ({
			type: 'function' as const,
			function: {
				name: m.tool!.name,
				description: m.tool!.description,
				parameters: {
					type: 'object',
					properties: Object.fromEntries(
						Object.entries(m.tool!.parameters ?? {}).map(([k, v]) => [
							k,
							{ type: 'string', description: String(v) }
						])
					),
					required: []
				}
			}
		}))
}

const SYSTEM_PROMPT = [
	'You are Rokkit — an assistant that responds by mounting live Svelte components in the chat.',
	'When the user asks for a chart, table, form, list, etc., call the matching tool with reasonable props.',
	'Always include a one-sentence prose reply alongside the tool call so the user understands the rendering.',
	'Prefer tool calls over describing the answer in prose.',
	"If the user's request doesn't fit any tool, say so briefly and suggest two concrete alternatives."
].join(' ')

/**
 * Initialise the engine on first use. Reports progress via the `llm`
 * reactive state. Safe to call multiple times — returns the cached
 * engine after the first successful load.
 */
export async function ensureEngine() {
	if (engine) return engine
	if (!detectWebGPU()) {
		llm.status = 'error'
		llm.errorMessage = 'WebGPU is not available in this browser. Chrome 113+ on a discrete GPU is the most reliable target.'
		return null
	}
	llm.status = 'loading'
	llm.loadProgress = 0
	llm.loadStage = 'Initialising web-llm…'
	try {
		const mod = await import('@mlc-ai/web-llm')
		engine = await mod.CreateMLCEngine(llm.modelId, {
			initProgressCallback: (p: { progress: number; text: string }) => {
				llm.loadProgress = p.progress
				llm.loadStage = p.text
			}
		})
		llm.status = 'ready'
		llm.loadProgress = 1
		llm.loadStage = 'Ready'
		return engine
	} catch (e) {
		llm.status = 'error'
		llm.errorMessage = (e as Error).message || String(e)
		return null
	}
}

/**
 * Drop the engine so the next route call re-loads. Used when the user
 * picks a different model.
 */
export function resetEngine() {
	engine = null
	llm.status = 'uninitialized'
	llm.loadProgress = 0
	llm.loadStage = ''
	llm.errorMessage = ''
}

/**
 * Phase-2 replacement for routeQuery. Returns Block[] in the same shape
 * the mock produces, so the rest of the chat UI is unchanged.
 */
export async function routeViaLLM(query: string): Promise<Block[]> {
	const e = await ensureEngine()
	if (!e) {
		return [
			{
				kind: 'prose',
				text: `Couldn't initialise the in-browser LLM — ${llm.errorMessage || 'unknown error'}`
			}
		]
	}
	llm.status = 'thinking'
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any = await e.chat.completions.create({
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: query }
			],
			tools: buildToolSpecs(),
			tool_choice: 'auto',
			temperature: 0.3
		})
		return parseCompletion(result)
	} catch (err) {
		return [
			{ kind: 'prose', text: `LLM error: ${(err as Error).message || String(err)}` }
		]
	} finally {
		llm.status = 'ready'
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCompletion(result: any): Block[] {
	const blocks: Block[] = []
	const choice = result?.choices?.[0]
	const message = choice?.message
	if (!message) {
		return [{ kind: 'prose', text: '(empty response)' }]
	}
	if (message.content) {
		blocks.push({ kind: 'prose', text: String(message.content) })
	}
	const toolCalls = (message.tool_calls ?? []) as Array<{
		function?: { name?: string; arguments?: string }
	}>
	for (const call of toolCalls) {
		const name = call.function?.name
		if (!name) continue
		let parsed: Record<string, unknown> = {}
		try {
			parsed = call.function?.arguments ? JSON.parse(call.function.arguments) : {}
		} catch {
			// LLM emitted invalid JSON — skip the tool but flag it
			blocks.push({
				kind: 'prose',
				text: `Tool ${name} returned invalid JSON arguments; skipping.`
			})
			continue
		}
		blocks.push({
			kind: 'component',
			tool: name,
			props: parsed,
			caption: `${name} · LLM tool call`
		})
	}
	if (blocks.length === 0) {
		blocks.push({ kind: 'prose', text: '(no content or tool calls)' })
	}
	return blocks
}
