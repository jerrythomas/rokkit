/**
 * Module-scoped chat-demo conversation store. One conversation per session
 * for now (no persistence). Each user query becomes two turns: the user's
 * message + the assistant's pending → resolved blocks.
 */
import type { ChatTurn } from './types'
import { routeQuery, routeData } from './router'
import { tryParse } from './infer'

let nextId = 0
const newId = () => `turn-${++nextId}-${Date.now()}`

export const conversation = $state<{ turns: ChatTurn[]; thinking: boolean }>({
	turns: [],
	thinking: false
})

function thinkThen(turn: ChatTurn): void {
	conversation.thinking = true
	setTimeout(() => {
		conversation.turns.push(turn)
		conversation.thinking = false
	}, 350)
}

export function submitQuery(query: string): void {
	const text = query.trim()
	if (!text) return
	conversation.turns.push({
		id: newId(),
		timestamp: Date.now(),
		role: 'user',
		text
	})
	thinkThen({
		id: newId(),
		timestamp: Date.now(),
		role: 'assistant',
		blocks: routeQuery(text)
	})
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
	conversation.turns.push({
		id: newId(),
		timestamp: Date.now(),
		role: 'user',
		text: summary
	})
	thinkThen({
		id: newId(),
		timestamp: Date.now(),
		role: 'assistant',
		blocks: routeData(source, parsed, query)
	})
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
	conversation.turns = []
	conversation.thinking = false
}
