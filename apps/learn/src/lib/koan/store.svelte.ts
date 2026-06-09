import type { ConversationMessage, UserMessage, ResponseMessage } from './types'
import { SvelteSet, SvelteDate } from 'svelte/reactivity'
import { read, write } from './persistence'
import { runMatch } from './match.svelte'

// NOTE: Breaking change — keys renamed from 'koan.*' to 'rokkit-site.*'.
// Existing local state under the old keys is silently ignored on next load.
const MESSAGES_KEY = 'rokkit-site.messages'
const RESET_FLAG_KEY = 'rokkit-site.reset.acknowledged'

function loadResetAcknowledged(): boolean {
	return read<boolean>(RESET_FLAG_KEY, (v) => typeof v === 'boolean') ?? false
}

function isConversationMessage(v: unknown): v is ConversationMessage {
	if (typeof v !== 'object' || v === null) return false
	const obj = v as Record<string, unknown>
	return (
		(obj.kind === 'user' || obj.kind === 'response') &&
		typeof obj.id === 'string' &&
		typeof obj.timestamp === 'string'
	)
}

function loadMessages(): ConversationMessage[] {
	return (
		read<ConversationMessage[]>(MESSAGES_KEY, (v) =>
			Array.isArray(v) && v.every(isConversationMessage)
		) ?? []
	)
}

export const koan = $state({
	query: '',
	activeDemoId: null as string | null,
	messages: loadMessages(),
	visitedThisSession: new SvelteSet<string>(),
	pendingReset: false,
	resetAcknowledged: loadResetAcknowledged()
})

export function selectDemo(demoId: string): void {
	koan.activeDemoId = demoId
	koan.visitedThisSession.add(demoId)
}

export function submitQuery(query: string): { matches: ReturnType<typeof runMatch> } {
	const q = query.trim()
	if (!q) return { matches: [] }
	const matches = runMatch(q)
	const ts = new SvelteDate().toISOString()
	const userMsg: UserMessage = {
		kind: 'user',
		id: `u-${Date.now().toString(36)}`,
		query: q,
		timestamp: ts
	}
	const copy =
		matches.length === 0
			? "I don't have anything matching that yet."
			: matches.length === 1
				? matches[0].description
				: `I have a few options that might fit.`
	const respMsg: ResponseMessage = {
		kind: 'response',
		id: `r-${Date.now().toString(36)}`,
		query: q,
		matches: matches.map((m) => m.id),
		copy,
		timestamp: ts
	}
	koan.messages = [...koan.messages, userMsg, respMsg]
	write(MESSAGES_KEY, koan.messages)
	koan.query = ''
	// Auto-select single best match
	if (matches.length === 1) {
		selectDemo(matches[0].id)
	}
	return { matches }
}

export function resetSession() {
	koan.query = ''
	koan.activeDemoId = null
	koan.messages = []
	koan.visitedThisSession.clear()
	write(MESSAGES_KEY, [])
}

export function requestReset(): void {
	if (koan.resetAcknowledged) {
		performReset()
		return
	}
	koan.pendingReset = true
}

export function cancelReset(): void {
	koan.pendingReset = false
}

export function performReset(): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.clear()
		// Re-write the acknowledgement flag so future resets skip the prompt
		localStorage.setItem(RESET_FLAG_KEY, JSON.stringify(true))
	}
	if (typeof location !== 'undefined') location.reload()
}
