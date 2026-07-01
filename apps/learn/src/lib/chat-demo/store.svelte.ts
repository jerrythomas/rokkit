/**
 * Chat-demo conversation API. Backed by the shared conversation store in
 * `$lib/koan/conversations` (surface='chat') — every submit lands as a
 * user turn + an assistant `blocks` turn, persisted to localStorage so the
 * shared sidebar can resume them later.
 *
 * The local `conversation` object exposes the chat-demo's existing reading
 * shape (turns[], thinking) as getters over the shared store so callers
 * don't need to know about the underlying schema.
 */
import type { ChatTurn, Block, ComponentBlock, SuggestionAction } from './types'
import type { ChatMode } from './modes'
import { routeQuery, routeData } from './router'
import { tryParse } from './infer'
import { routeViaLLM, llm, type LLMProvider } from './llm.svelte'
import {
	startNew,
	appendUser as sharedAppendUser,
	appendAssistant as sharedAppendAssistant,
	getCurrentConversation,
	getCurrentId,
	setCurrentId,
	renameConversation,
	type ChatProvider,
	type Turn
} from '$lib/koan/conversations.svelte'

/** Snapshot the current provider + model so the conversation records who
 * produced each assistant turn. Resume can use this to restore the toggle. */
function currentProviderStamp(): { provider: ChatProvider; model?: string } {
	if (!llm.enabled) return { provider: 'scripted' }
	if (llm.provider === 'webllm') return { provider: 'webllm', model: llm.webllmModel }
	return { provider: 'openrouter', model: llm.openRouterModel }
}

function toChatTurn(t: Turn): ChatTurn {
	const timestamp = Date.parse(t.at)
	if (t.kind === 'user') {
		return { id: t.id, timestamp, role: 'user', text: t.text }
	}
	// `tweak` turns are canvas-scoped and never carry chat content; render them
	// as an empty assistant turn. Only `assistant` turns have a `body`.
	if (t.kind !== 'assistant') {
		return { id: t.id, timestamp, role: 'assistant', blocks: [] }
	}
	const blocks = t.body.kind === 'blocks' ? (t.body.blocks as Block[]) : []
	const provider = t.body.kind === 'blocks' ? t.body.provider : undefined
	const model = t.body.kind === 'blocks' ? t.body.model : undefined
	return { id: t.id, timestamp, role: 'assistant', blocks, provider, model }
}

let _thinking = $state(false)
let _pending = $state<string | null>(null)

/** Seed a prompt from the picker; the mode page consumes it once on mount. */
export function setPendingPrompt(text: string): void {
	_pending = text
}

export function takePendingPrompt(): string | null {
	const p = _pending
	_pending = null
	return p
}

export const conversation = {
	get turns(): ChatTurn[] {
		const conv = getCurrentConversation()
		if (!conv || conv.surface !== 'chat') return []
		return conv.turns.map(toChatTurn)
	},
	get thinking(): boolean {
		return _thinking
	},
	set thinking(v: boolean) {
		_thinking = v
	}
}

const PROVIDER_TO_MODE: Record<LLMProvider, ChatMode> = {
	openrouter: 'openrouter',
	webllm: 'webllm'
}

/** Active route mode from engine state (scripted engine → 'simulated'). */
function currentMode(): ChatMode {
	return llm.enabled ? PROVIDER_TO_MODE[llm.provider] : 'simulated'
}

/** Create the chat conversation lazily, or append a user turn if one exists. */
function pushUser(text: string): void {
	const cur = getCurrentConversation()
	if (!cur || cur.surface !== 'chat') {
		startNew('chat', text, currentMode())
		return
	}
	sharedAppendUser(text)
}

// Known component tools; anything not listed keeps the query-derived title.
const COMPONENT_TITLES: Record<string, string> = {
	mount_bar_chart: 'Bar chart',
	mount_table: 'Products table',
	mount_form: 'Form',
	mount_list: 'List'
}

function pushAssistant(blocks: Block[]): void {
	const conv = getCurrentConversation()
	const firstAssistant = Boolean(conv) && !conv.turns.some((t) => t.kind === 'assistant')
	const stamp = currentProviderStamp()
	sharedAppendAssistant({ kind: 'blocks', blocks, ...stamp })
	// A+B titling: if the opening response is exactly one known component, prefer its type.
	if (firstAssistant && blocks.length === 1 && blocks[0].kind === 'component') {
		const label = COMPONENT_TITLES[(blocks[0] as ComponentBlock).tool]
		const id = getCurrentId()
		if (label && id) renameConversation(id, label)
	}
}

function thinkThenBlocks(blocks: Block[]): void {
	_thinking = true
	setTimeout(() => {
		pushAssistant(blocks)
		_thinking = false
	}, 350)
}

export function submitQuery(query: string): void {
	const text = query.trim()
	if (!text) return
	pushUser(text)
	if (llm.enabled) {
		_thinking = true
		routeViaLLM(text)
			.then((blocks) => {
				pushAssistant(blocks)
			})
			.finally(() => {
				_thinking = false
			})
		return
	}
	thinkThenBlocks(routeQuery(text))
}

/**
 * Submit a JSON/CSV/parsed payload. Routes to the data inference pipeline.
 * The user turn shows a short summary (so the chat history stays readable);
 * the full data lives in the assistant's response blocks.
 */
export function submitData(args: {
	source: 'json' | 'csv'
	text: string
	parsed: unknown
	query?: string
}): void {
	const { source, text, parsed, query } = args
	const summary = summariseUpload(source, text, parsed, query)
	pushUser(summary)
	thinkThenBlocks(routeData(source, parsed, query))
}

/**
 * Push an "I edited this; here's the new value" turn. Triggered from
 * inside an inline component when the user clicks Save / Export. The user
 * turn summarises what they did; the assistant turn shows the JSON.
 */
export function submitExport(args: {
	source: string
	data: unknown
	caption?: string
}): void {
	const { source, data, caption } = args
	const isObj = typeof data === 'object' && data !== null
	const detail = Array.isArray(data)
		? `${data.length} rows`
		: isObj
			? `${Object.keys(data as Record<string, unknown>).length} fields`
			: 'value'
	const label = caption ?? source
	pushUser(`Saved changes to "${label}" · ${detail}`)
	thinkThenBlocks([
		{
			kind: 'prose',
			text: "Here's the updated value — copy or paste it back to keep the round-trip going."
		},
		{
			kind: 'code',
			language: 'json',
			filename: 'edited.json',
			code: JSON.stringify(data, null, 2)
		},
		{
			kind: 'suggestions',
			intro: 'Or',
			items: [
				{
					label: 'Render again',
					query: JSON.stringify(data)
				}
			]
		}
	])
}

/**
 * Dispatch a data-aware suggestion. Reshapes existing data through the
 * inference pipeline with a forced shape, or remounts a component with
 * different props. No re-parsing, no second paste — the user's data lives
 * inside the action.
 */
export function submitAction(item: { label?: string; action: SuggestionAction }): void {
	const { action, label } = item
	const userText = label ? `[suggestion] ${label}` : '[suggestion]'
	pushUser(userText)
	if (action.kind === 'reshape') {
		thinkThenBlocks(routeData(action.source, action.data, label, action.force))
		return
	}
	if (action.kind === 'props') {
		thinkThenBlocks([
			{
				kind: 'prose',
				text: `Re-rendered with new props for ${action.tool}.`
			},
			{
				kind: 'component',
				tool: action.tool,
				props: action.props,
				caption: action.caption
			}
		])
		return
	}
	if (action.kind === 'switch-provider') {
		llm.provider = action.provider
		thinkThenBlocks([
			{
				kind: 'prose',
				text:
					action.provider === 'webllm'
						? 'Switched to Web-LLM. Click "Load model" in the chrome — first-time download is ~1–2 GB and runs entirely in the browser after.'
						: 'Switched to OpenRouter.'
			}
		])
		return
	}
}

/**
 * Try to parse a free-form text submission. If it parses as JSON or CSV,
 * route through the data pipeline; otherwise fall back to keyword routing.
 */
export function submitText(text: string): void {
	const trimmed = text.trim()
	if (!trimmed) return
	const parsed = tryParse(trimmed)
	if (parsed.ok) {
		submitData({ source: parsed.format, text: trimmed, parsed: parsed.value })
		return
	}
	submitQuery(trimmed)
}

function summariseUpload(source: 'json' | 'csv', text: string, parsed: unknown, query?: string): string {
	const head = query?.trim() ? `${query.trim()} — ` : ''
	if (Array.isArray(parsed)) {
		return `${head}pasted ${source.toUpperCase()} · ${parsed.length} rows`
	}
	if (typeof parsed === 'object' && parsed !== null) {
		const keys = Object.keys(parsed as Record<string, unknown>)
		return `${head}pasted ${source.toUpperCase()} · 1 record · ${keys.length} fields`
	}
	const preview = text.length > 80 ? `${text.slice(0, 80)}…` : text
	return `${head}pasted ${source.toUpperCase()}: ${preview}`
}

export function resetConversation(): void {
	setCurrentId(null)
	_thinking = false
}

/**
 * Sync the llm toggle back to whatever the current chat conversation's
 * most recent assistant turn used. Lets resume default to the original
 * provider; the user can still switch mid-thread afterwards.
 */
export function syncLLMFromCurrentConversation(): void {
	const conv = getCurrentConversation()
	if (!conv || conv.surface !== 'chat') return
	for (let i = conv.turns.length - 1; i >= 0; i--) {
		const t = conv.turns[i]
		if (t.kind !== 'assistant' || t.body.kind !== 'blocks' || !t.body.provider) continue
		const { provider, model } = t.body
		if (provider === 'scripted') {
			llm.enabled = false
		} else {
			llm.enabled = true
			llm.provider = provider
			if (model && provider === 'openrouter') llm.openRouterModel = model
			if (model && provider === 'webllm') llm.webllmModel = model
		}
		return
	}
}
