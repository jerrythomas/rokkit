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
import { catalog } from '$lib/koan/catalog'

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
	includeCode: boolean
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
	includeCode: false,
	openRouterModel: DEFAULT_OPENROUTER_MODEL,
	webllmModel: DEFAULT_WEBLLM_MODEL,
	webllmStatus: 'uninitialized',
	webllmProgress: 0,
	webllmStage: '',
	errorMessage: '',
	webgpuSupported: null
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let webllmEngine: any = null

export function detectWebGPU(): boolean {
	if (typeof navigator === 'undefined') return false
	const supported = typeof (navigator as { gpu?: unknown }).gpu !== 'undefined'
	llm.webgpuSupported = supported
	return supported
}

// ─── Tool schema (shared by both providers) ────────────────────────────

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

/**
 * The free OpenRouter tier doesn't route to providers that support
 * OpenAI-style `tools` / `tool_choice`. Instead we ask the model to
 * return a strict JSON envelope and parse it ourselves. The same
 * envelope works for web-llm (which DOES support tool calls but is
 * happier with this format too).
 *
 * The prompt does three things:
 * 1. Describes the envelope shape (say + render + optional code).
 * 2. Lists tools from the catalog so the model knows what exists.
 * 3. Embeds one full example per common tool so the model has a
 *    concrete prop shape to copy from. This dramatically reduces
 *    malformed responses — small free-tier models will faithfully
 *    mimic the examples but struggle to invent prop shapes.
 */
const TOOL_EXAMPLES: Record<string, { user: string; envelope: object }> = {
	mount_bar_chart: {
		user: 'Show a bar chart of quarterly revenue',
		envelope: {
			say: "Here's quarterly revenue rendered as a bar chart.",
			render: [
				{
					tool: 'mount_bar_chart',
					props: {
						data: [
							{ quarter: 'Q1', revenue: 42 },
							{ quarter: 'Q2', revenue: 58 },
							{ quarter: 'Q3', revenue: 51 },
							{ quarter: 'Q4', revenue: 73 }
						],
						x: 'quarter',
						y: 'revenue',
						height: 240,
						grid: true
					}
				}
			]
		}
	},
	mount_table: {
		user: 'Show a sortable products table',
		envelope: {
			say: 'Six rows of products, columns inferred from the row shape — click any header to sort.',
			render: [
				{
					tool: 'mount_table',
					props: {
						data: [
							{ name: 'Laptop', price: 1299, stock: 45 },
							{ name: 'Phone', price: 899, stock: 120 },
							{ name: 'Tablet', price: 599, stock: 78 }
						],
						caption: 'Products'
					}
				}
			]
		}
	},
	mount_form: {
		user: 'Render a sign-up form',
		envelope: {
			say: 'A schema-driven form. `bind:data` round-trips the values.',
			render: [
				{
					tool: 'mount_form',
					props: {
						schema: {
							type: 'object',
							properties: {
								name: { type: 'string', required: true },
								email: { type: 'string', format: 'email', required: true },
								role: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
								newsletter: { type: 'boolean' }
							}
						},
						data: { name: '', email: '', role: 'viewer', newsletter: true }
					}
				}
			]
		}
	},
	mount_list: {
		user: 'Show a settings list with collapsible groups',
		envelope: {
			say: 'Settings shape — three groups, items inside.',
			render: [
				{
					tool: 'mount_list',
					props: {
						items: [
							{
								label: 'General',
								children: [{ label: 'Profile' }, { label: 'Account' }]
							},
							{
								label: 'Appearance',
								children: [{ label: 'Theme' }, { label: 'Density' }]
							}
						],
						collapsible: true
					}
				}
			]
		}
	},
	mount_stepper: {
		user: 'Show a 4-step sign-up flow with step 2 active',
		envelope: {
			say: 'A 4-step Stepper with steps 1 and 2 completed.',
			render: [
				{
					tool: 'mount_stepper',
					props: {
						steps: [
							{ text: 'Account', completed: true },
							{ text: 'Profile', completed: true },
							{ text: 'Preferences' },
							{ text: 'Review' }
						],
						current: 2
					}
				}
			]
		}
	}
}

function buildSystemPrompt(includeCode: boolean): string {
	const tools = catalog
		.filter((m) => m.tool)
		.map(
			(m) =>
				`  - ${m.tool!.name}: ${m.tool!.description}\n    params: ${JSON.stringify(m.tool!.parameters ?? {})}`
		)
		.join('\n')
	const examples = Object.entries(TOOL_EXAMPLES)
		.map(
			([, ex]) =>
				`User: ${ex.user}\nAssistant: ${JSON.stringify(ex.envelope, null, 0)}`
		)
		.join('\n\n')
	const lines = [
		'You are Rokkit — an assistant that responds by mounting live Svelte components in the chat.',
		'',
		'You MUST reply with ONLY a single JSON object (no prose outside, no markdown fence) of the shape:',
		'  { "say": string,                        // one short sentence, < 25 words',
		`    "render": [ { "tool": string, "props": object } ]${ 
			includeCode ? ',\n    "code"?: [ { "language": string, "filename"?: string, "code": string } ] }' : ' }'}`,
		'',
		'`say` is one short sentence explaining the response.',
		'`render` is the list of components to mount inline. Use it whenever you can express the answer as a UI.'
	]
	if (includeCode) {
		lines.push(
			'`code` is optional — include a code sample only when the user explicitly asks for source / a snippet / "how does this work". NEVER put code in `say`.'
		)
	} else {
		lines.push(
			'DO NOT include any `code` field. The user has code samples turned off — respond with `render` only.'
		)
	}
	lines.push(
		'',
		'Available tools (pick from these names; the params show fields the user might mention):',
		tools,
		'',
		'Examples (always copy these prop shapes — they map 1:1 to what Rokkit components expect):',
		examples,
		'',
		'Rules:',
		'- Output ONE JSON object only. No prose before or after. No ```json fences.',
		'- Prop shapes MUST match the examples (data is an array of row objects; schema is JSON-Schema-ish; steps use `text` not `label`).',
		'- If the request does not match any tool, return { "say": "...", "render": [] } where `say` suggests two concrete alternatives.',
		'- Pick reasonable defaults; you do not need to ask the user for missing fields.'
	)
	return lines.join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCompletion(result: any): Block[] {
	const blocks: Block[] = []
	const choice = result?.choices?.[0]
	const message = choice?.message
	if (!message) return [{ kind: 'prose', text: '(empty response)' }]

	const content = String(message.content ?? '').trim()

	// 1. OpenAI-style tool_calls (web-llm + paid OpenRouter routes)
	const toolCalls = (message.tool_calls ?? []) as Array<{
		function?: { name?: string; arguments?: string }
	}>
	if (toolCalls.length > 0) {
		if (content) blocks.push({ kind: 'prose', text: content })
		for (const call of toolCalls) {
			const name = call.function?.name
			if (!name) continue
			let parsed: Record<string, unknown> = {}
			try {
				parsed = call.function?.arguments ? JSON.parse(call.function.arguments) : {}
			} catch {
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
		return blocks
	}

	// 2. JSON envelope { say, render, code? } (free tier)
	const json = extractJsonEnvelope(content)
	if (json && typeof json === 'object') {
		const env = json as { say?: unknown; render?: unknown; code?: unknown }
		if (typeof env.say === 'string' && env.say.trim()) {
			blocks.push({ kind: 'prose', text: env.say })
		}
		if (Array.isArray(env.render)) {
			for (const item of env.render) {
				if (typeof item !== 'object' || item === null) continue
				const cell = item as { tool?: unknown; props?: unknown }
				if (typeof cell.tool === 'string') {
					blocks.push({
						kind: 'component',
						tool: cell.tool,
						props: (cell.props as Record<string, unknown>) ?? {},
						caption: `${cell.tool} · LLM`
					})
				}
			}
		}
		// Respect the user's "include code" toggle. Even if the LLM emits a
		// code field unprompted, filter it out unless the user opted in.
		if (Array.isArray(env.code) && llm.includeCode) {
			for (const item of env.code) {
				if (typeof item !== 'object' || item === null) continue
				const cell = item as { language?: unknown; filename?: unknown; code?: unknown }
				if (typeof cell.code === 'string') {
					blocks.push({
						kind: 'code',
						language: typeof cell.language === 'string' ? cell.language : 'text',
						filename: typeof cell.filename === 'string' ? cell.filename : undefined,
						code: cell.code
					})
				}
			}
		}
		if (blocks.length > 0) return blocks
	}

	// 3. Plain-text fallback — the model ignored our schema. Surface what
	// it said so the user can correct or rephrase.
	if (content) return [{ kind: 'prose', text: content }]
	return [{ kind: 'prose', text: '(no content or tool calls)' }]
}

/**
 * Try to extract a JSON object from the model's response. Models often
 * wrap output in ```json fences or add trailing prose — we strip those.
 */
function extractJsonEnvelope(text: string): unknown {
	const trimmed = text.trim()
	if (!trimmed) return null
	// Strip ```json ... ``` fence
	const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i)
	const candidate = fence ? fence[1] : trimmed
	// Locate first { and matching closing }
	const start = candidate.indexOf('{')
	if (start < 0) return null
	let depth = 0
	for (let i = start; i < candidate.length; i++) {
		const ch = candidate[i]
		if (ch === '{') depth++
		else if (ch === '}') {
			depth--
			if (depth === 0) {
				try {
					return JSON.parse(candidate.slice(start, i + 1))
				} catch {
					return null
				}
			}
		}
	}
	return null
}

// ─── OpenRouter provider (default) ─────────────────────────────────────

async function routeViaOpenRouter(query: string): Promise<Block[]> {
	// Free tier providers don't all support OpenAI tool-calling. We ask the
	// model to emit a strict JSON envelope (see SYSTEM_PROMPT) and parse it
	// ourselves. response_format hints JSON-mode for providers that honour
	// it; the parser is forgiving for those that don't.
	const res = await fetch('/api/llm/openrouter', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: llm.openRouterModel,
			messages: [
				{ role: 'system', content: buildSystemPrompt(llm.includeCode) },
				{ role: 'user', content: query }
			],
			response_format: { type: 'json_object' },
			temperature: 0.3
		})
	})
	if (!res.ok) {
		const text = await res.text()
		throw new Error(`${res.status} · ${text.slice(0, 200)}`)
	}
	return parseCompletion(await res.json())
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any = await e.chat.completions.create({
			messages: [
				{ role: 'system', content: buildSystemPrompt(llm.includeCode) },
				{ role: 'user', content: query }
			],
			tools: buildToolSpecs(),
			tool_choice: 'auto',
			temperature: 0.3
		})
		return parseCompletion(result)
	} catch (err) {
		const msg = (err as Error).message || String(err)
		return [
			{
				kind: 'error',
				title: 'Web-LLM request failed',
				message: msg.length > 240 ? `${msg.slice(0, 240)  }…` : msg,
				details: msg.length > 240 ? msg : undefined
			}
		]
	} finally {
		llm.webllmStatus = 'ready'
	}
}

// ─── Public entry point ────────────────────────────────────────────────

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
			// Match "<status> · ..." formed by routeViaOpenRouter.
			const statusMatch = raw.match(/^(\d{3})\s+·\s+(.+)$/s)
			const status = statusMatch ? statusMatch[1] : ''
			const detail = statusMatch ? statusMatch[2] : raw
			const title =
				status === '429'
					? 'Rate-limited by the free provider'
					: status === '404'
						? `Model unavailable (${llm.openRouterModel})`
						: status === '503'
							? 'OpenRouter unreachable'
							: status
								? `OpenRouter ${status}`
								: 'OpenRouter request failed'
			const hint =
				status === '429'
					? 'Try a different free model, retry in a moment, or switch to Web-LLM (one-time browser download).'
					: status === '404'
						? 'Pick another model from the dropdown — the free model list rotates.'
						: 'Switch to Web-LLM if this keeps failing, or retry.'
			return [
				{
					kind: 'error',
					title,
					message: detail.length > 240 ? `${detail.slice(0, 240)  }…` : detail,
					details: detail.length > 240 ? detail : undefined,
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
