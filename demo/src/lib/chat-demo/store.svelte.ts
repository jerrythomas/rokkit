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
import type { ChatTurn, Block, SuggestionAction } from './types'
import { routeQuery, routeData } from './router'
import { tryParse } from './infer'
import { routeViaLLM, llm } from './llm.svelte'
import {
	startNew,
	appendUser as sharedAppendUser,
	appendAssistant as sharedAppendAssistant,
	getCurrentConversation,
	setCurrentId,
	type Turn
} from '$lib/koan/conversations.svelte'

function toChatTurn(t: Turn): ChatTurn {
	const timestamp = Date.parse(t.at)
	if (t.kind === 'user') {
		return { id: t.id, timestamp, role: 'user', text: t.text }
	}
	const blocks = t.body.kind === 'blocks' ? (t.body.blocks as Block[]) : []
	return { id: t.id, timestamp, role: 'assistant', blocks }
}

let _thinking = $state(false)

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

/** Create the chat conversation lazily, or append a user turn if one exists. */
function pushUser(text: string): void {
	const cur = getCurrentConversation()
	if (!cur || cur.surface !== 'chat') {
		startNew('chat', text)
		return
	}
	sharedAppendUser(text)
}

function pushAssistant(blocks: Block[]): void {
	sharedAppendAssistant({ kind: 'blocks', blocks })
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
