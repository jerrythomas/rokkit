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
	showCode: boolean
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
	showCode: false,
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

function buildSystemPrompt(): string {
	return [
		'You are Rokkit — an assistant that responds by mounting live Svelte components in the chat.',
		'',
		'Respond in MARKDOWN. Prose narrates; live components come from fenced code blocks whose language is the component type. The renderer turns each fence into the matching live component. Available fences:',
		'',
		'  ```plot       — bar/line/area/scatter charts (Vega-Lite-ish PlotSpec)',
		'  ```table      — sortable tabular data',
		'  ```form       — schema-driven editable forms; supports submit actions',
		'  ```list       — flat or grouped lists with optional collapsible groups',
		'  ```stepper    — multi-step progress / wizard',
		'  ```sparkline  — small inline trend lines',
		'  ```mermaid    — diagrams / flowcharts',
		'',
		'Each fence MUST contain ONE JSON object that matches that fence type. Use the examples below — copy shapes 1:1.',
		'',
		'─── PLOT (bar chart) ──────────────────────',
		'```plot',
		'{ "data": [{"quarter":"Q1","revenue":42},{"quarter":"Q2","revenue":58},{"quarter":"Q3","revenue":51},{"quarter":"Q4","revenue":73}],',
		'  "x":"quarter","y":"revenue","geoms":[{"type":"bar"}] }',
		'```',
		'',
		'─── TABLE ─────────────────────────────────',
		'```table',
		'{ "columns":["name","price","stock"],',
		'  "rows":[{"name":"Laptop","price":1299,"stock":45},{"name":"Phone","price":899,"stock":120}] }',
		'```',
		'',
		'─── FORM (editable record) ────────────────',
		'```form',
		'{ "schema": { "type":"object","properties": {',
		'    "name":{"type":"string","required":true},',
		'    "email":{"type":"string","format":"email","required":true},',
		'    "role":{"type":"string","enum":["admin","editor","viewer"]},',
		'    "newsletter":{"type":"boolean"} } },',
		'  "data": { "name":"", "email":"", "role":"viewer", "newsletter":true } }',
		'```',
		'',
		'─── FORM (human-in-the-loop submit) ───────',
		'When you need structured input from the human to continue, render a form with `submitAction`. On submit the renderer dispatches the data back as a new user message; you continue from there.',
		'```form',
		'{ "schema": { "type":"object","properties": {',
		'    "priority":{"type":"string","enum":["low","med","high"]},',
		'    "description":{"type":"string"} } },',
		'  "data": { "priority":"med" },',
		'  "submitAction":"file_ticket",',
		'  "submitLabel":"File ticket" }',
		'```',
		'',
		'─── FORM (cascading dropdowns via lookups) ─',
		'Lookups populate options for a field. Use `source` for static lists, or `url` (with {placeholders}) for server lookups that depend on other fields. `dependsOn` lists field paths that re-trigger the fetch when they change.',
		'```form',
		'{ "schema": { "type":"object","properties": {',
		'    "country":{"type":"string"},',
		'    "city":{"type":"string"} } },',
		'  "data": { "country":"", "city":"" },',
		'  "lookups": {',
		'    "country": { "source": [{"value":"FR","label":"France"},{"value":"IN","label":"India"}] },',
		'    "city": { "url":"/api/cities?country={country}", "dependsOn":["country"] }',
		'  } }',
		'```',
		'',
		'─── LIST (grouped, collapsible) ───────────',
		'```list',
		'{ "items":[',
		'    {"label":"General","children":[{"label":"Profile"},{"label":"Account"}]},',
		'    {"label":"Appearance","children":[{"label":"Theme"},{"label":"Density"}]}],',
		'  "collapsible":true }',
		'```',
		'',
		'─── STEPPER ───────────────────────────────',
		'```stepper',
		'{ "steps":[',
		'    {"text":"Account","completed":true},',
		'    {"text":"Profile","completed":true},',
		'    {"text":"Preferences"},',
		'    {"text":"Review"} ],',
		'  "current":2 }',
		'```',
		'',
		'Rules:',
		'- Always mount a live component for UI requests — never describe a chart only in prose.',
		'- Prop shapes MUST match the examples (steps use `text` not `label`; table uses `columns` + `rows`).',
		'- Keep prose short — one or two sentences before the fence is enough.',
		'- You may include source-code blocks (```svelte, ```ts, ```js) when the user explicitly asks for code; the renderer decides whether to show them.',
		'- If the request does not fit any fence, respond with prose only and suggest two concrete alternatives.'
	].join('\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCompletion(result: any): Block[] {
	const choice = result?.choices?.[0]
	const message = choice?.message
	if (!message) return [{ kind: 'prose', text: '(empty response)' }]

	const content = String(message.content ?? '').trim()

	// 1. OpenAI-style tool_calls (web-llm + paid OpenRouter routes).
	// Convert each tool call into a markdown fence the renderer's plugin
	// system understands. The naming convention: tool `mount_bar_chart`
	// → fence language `plot`, `mount_table` → `table`, etc.
	const toolCalls = (message.tool_calls ?? []) as Array<{
		function?: { name?: string; arguments?: string }
	}>
	if (toolCalls.length > 0) {
		const blocks: Block[] = []
		if (content) blocks.push({ kind: 'prose', text: content })
		const out: string[] = []
		for (const call of toolCalls) {
			const name = call.function?.name
			if (!name) continue
			const lang = toolNameToFence(name)
			if (!lang) continue
			out.push(`\n\`\`\`${lang}\n${call.function?.arguments ?? '{}'}\n\`\`\`\n`)
		}
		if (out.length > 0) blocks.push({ kind: 'markdown', markdown: out.join('') })
		return blocks
	}

	// 2. Markdown body (preferred — the system prompt asks for it). Pass
	// through verbatim; MarkdownRenderer + the plugin set turn ```plot,
	// ```table, ```form, ```list, ```stepper fences into live components.
	if (content) return [{ kind: 'markdown', markdown: content }]
	return [{ kind: 'prose', text: '(empty response)' }]
}

function toolNameToFence(name: string): string | null {
	if (name === 'mount_bar_chart') return 'plot'
	if (name === 'mount_table') return 'table'
	if (name === 'mount_form') return 'form'
	if (name === 'mount_list') return 'list'
	if (name === 'mount_stepper') return 'stepper'
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
				{ role: 'system', content: buildSystemPrompt() },
				{ role: 'user', content: query }
			],
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
