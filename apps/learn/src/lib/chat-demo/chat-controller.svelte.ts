/**
 * Logic controller for the /chat surface.
 *
 * Holds the page's pure functions + reactive state so the route pages stay
 * thin: message mapping, submit/suggestion handlers, sidebar history, file
 * parsing. DOM-bound concerns (the stream ref, autoscroll, drag-over flag,
 * the hidden file input) stay in the component — this module never touches
 * the DOM. Runes are allowed here because the file is a `.svelte.ts` module.
 */
import type { ChatMessage as ChatMessageData } from '@rokkit/ui'
import type { ChatMode } from './modes'
import { MODES } from './modes'
import {
	conversation,
	submitText,
	submitData,
	syncLLMFromCurrentConversation
} from '$lib/chat-demo/store.svelte'
import { llm } from '$lib/chat-demo/llm.svelte'
import {
	bucketByRecency,
	recencyLabel,
	loadConversation,
	setCurrentId,
	type Conversation
} from '$lib/koan/conversations.svelte'
import { findById } from '$lib/koan/catalog'
import { goto } from '$app/navigation'
import { tryParse, parseCSV } from '$lib/chat-demo/infer'

// Re-export so the page can render sidebar rows without importing the store
// module directly.
export { recencyLabel }

// ─── Sample data (welcome chips) ─────────────────────────────────────────
// Example *prompts* now live in modes.ts (the picker owns them). These are
// sample *data* payloads — pasting them exercises the JSON inference path.

export const SAMPLE_SALES = JSON.stringify(
	[
		{ region: 'EMEA', product: 'Hardware', revenue: 124 },
		{ region: 'EMEA', product: 'Software', revenue: 81 },
		{ region: 'APAC', product: 'Hardware', revenue: 92 },
		{ region: 'APAC', product: 'Software', revenue: 67 },
		{ region: 'AMER', product: 'Hardware', revenue: 156 },
		{ region: 'AMER', product: 'Software', revenue: 119 }
	],
	null,
	2
)

export const SAMPLE_USER = JSON.stringify(
	{
		name: 'Maya Anand',
		email: 'maya@example.com',
		role: 'editor',
		joinedAt: '2025-08-12',
		active: true,
		signupCount: 3
	},
	null,
	2
)

/** Example prompts for a given mode — sourced from the mode descriptor. */
export function examplesFor(mode: ChatMode): string[] {
	return MODES.find((c) => c.mode === mode)?.examples ?? []
}

// ─── Composer + reactive state ───────────────────────────────────────────

export const composerValue = $state({ value: '' })
export const attachError = $state<{ message: string | null }>({ message: null })
export const collapsed = $state({ value: false })

// ─── Message mapping ─────────────────────────────────────────────────────
// Map the demo store's turns onto the @rokkit/ui ChatMessage shape.
// User turns carry plain text; assistant turns stash their rendered
// `blocks` (+ provider) in `data`, read back by the `message` snippet.
// A synthetic trailing message represents the "thinking" indicator.

export type AssistantData = {
	blocks?: import('$lib/chat-demo/types').Block[]
	provider?: 'scripted' | 'openrouter' | 'webllm'
	thinking?: boolean
}

/** In-flight provider for the thinking eyebrow — derived from llm state
 * (the scripted engine surfaces as 'scripted' in the AssistantData shape). */
function thinkingProvider(): 'scripted' | 'openrouter' | 'webllm' {
	return llm.enabled ? llm.provider : 'scripted'
}

export const messages = $derived<ChatMessageData<AssistantData>[]>([
	...conversation.turns.map((turn) =>
		turn.role === 'user'
			? { id: turn.id, role: 'user' as const, text: turn.text }
			: {
					id: turn.id,
					role: 'assistant' as const,
					status: 'done' as const,
					data: { blocks: turn.blocks, provider: turn.provider }
				}
	),
	...(conversation.thinking
		? [
				{
					id: '__thinking',
					role: 'assistant' as const,
					status: 'streaming' as const,
					// Stamp the in-flight provider so the bot-name eyebrow shows
					// who is answering (OpenRouter / Web-LLM / Scripted) while it thinks.
					data: { thinking: true, provider: thinkingProvider() }
				}
			]
		: [])
])

// ─── Submit + suggestions ────────────────────────────────────────────────

export function send(text: string = composerValue.value): void {
	const q = text.trim()
	if (!q || conversation.thinking) return
	composerValue.value = ''
	attachError.message = null
	// submitText auto-detects JSON / CSV; falls back to keyword routing.
	// Auto-scroll is the component's concern — nothing DOM-bound here.
	submitText(q)
}

export function handleSuggestion(query: string): void {
	composerValue.value = query
	send()
}

// ─── Sidebar history ─────────────────────────────────────────────────────
// Same shared store as /app, but scoped to the chat surface + a mode.

/** Mode-scoped history buckets for the sidebar (today / yesterday / earlier). */
export function bucketsFor(mode: ChatMode) {
	return bucketByRecency('chat', mode)
}

export function convIcon(conv: Conversation): string {
	if (conv.surface === 'chat') return 'i-mdi:chat-processing-outline'
	const lastDemo = [...conv.turns]
		.reverse()
		.find((t) => t.kind === 'assistant' && t.body.kind === 'demo')
	if (lastDemo && lastDemo.kind === 'assistant' && lastDemo.body.kind === 'demo') {
		return findById(lastDemo.body.demoType)?.icon ?? 'i-mdi:chat-outline'
	}
	return 'i-mdi:chat-outline'
}

/**
 * Resume a chat conversation: route to its own mode, load it, and sync the
 * engine to whatever produced its last assistant turn. The stream re-renders
 * reactively via the conversation.turns getter.
 */
export function resumeConversation(conv: Conversation): void {
	goto('/chat/' + (conv.mode ?? 'simulated'))
	loadConversation(conv.id)
	syncLLMFromCurrentConversation()
}

export function startNewChat(): void {
	setCurrentId(null)
	composerValue.value = ''
	attachError.message = null
}

// ─── File / data upload ──────────────────────────────────────────────────
// Pure read+parse+submit. The DOM bits (drag-over flag, the hidden input,
// clearing input.value) stay in the component; it calls submitFile(file).

export async function submitFile(file: File): Promise<void> {
	attachError.message = null
	const text = await file.text()
	const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv'
	if (isCsv) {
		try {
			const rows = parseCSV(text)
			if (rows.length === 0) {
				attachError.message = 'CSV file parsed to no rows.'
				return
			}
			submitData({ source: 'csv', text, parsed: rows, query: `Uploaded ${file.name}` })
		} catch (e) {
			attachError.message = `CSV error: ${(e as Error).message}`
		}
		return
	}
	const parsed = tryParse(text)
	if (parsed.ok === false) {
		attachError.message = parsed.error
		return
	}
	submitData({
		source: parsed.format,
		text,
		parsed: parsed.value,
		query: `Uploaded ${file.name}`
	})
}
