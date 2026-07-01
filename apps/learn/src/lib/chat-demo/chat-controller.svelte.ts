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
import { conversation, submitText, submitData } from '$lib/chat-demo/store.svelte'
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

// A module can't export `$derived` state directly (svelte.dev/e/derived_invalid_export).
// Keep the derivation module-scoped and expose it through a getter object so the
// page reads `messages.current` reactively — same wrapper convention as
// composerValue / attachError / collapsed above.
const _messages = $derived<ChatMessageData<AssistantData>[]>([
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

export const messages = {
	get current(): ChatMessageData<AssistantData>[] {
		return _messages
	}
}

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
// Same shared store as /app. All chat modes share one sidebar so the user
// can hop between Simulated / OpenRouter / Web-LLM without losing context;
// per-row mode badges disambiguate. Kept as a function of `mode` (even
// though the mode is unused inside) so the call site stays symmetrical with
// resumeConversation / etc. and future per-mode filtering (a toggle?) can
// re-introduce a filter without breaking callers.

/** Chat history buckets — today / yesterday / earlier, ALL modes merged. */
export function bucketsFor(_mode: ChatMode) {
	return bucketByRecency('chat')
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
 * Resume a chat conversation: route to its own mode (carrying the model that
 * produced its last assistant turn), then load it. The route's setEngine effect
 * owns engine selection now, so we don't sync llm state here — we just put the
 * mode + model in the URL and let the /chat/[mode] page derive the engine. The
 * stream re-renders reactively via the conversation.turns getter.
 */
// bucketsFor() filters the sidebar to the 'chat' surface, so callers never
// pass app-surface conversations here; app resume lives in the /app layout.
export function resumeConversation(conv: Conversation): void {
	const mode = conv.mode ?? 'simulated'
	const last = [...conv.turns].reverse().find(
		(t) => t.kind === 'assistant' && t.body.kind === 'blocks'
	)
	const model =
		last && last.kind === 'assistant' && last.body.kind === 'blocks' ? last.body.model : undefined
	goto(`/chat/${mode}${model ? `?model=${encodeURIComponent(model)}` : ''}`)
	loadConversation(conv.id)
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
