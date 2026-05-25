/**
 * Module-scoped chat-demo conversation store. One conversation per session
 * for now (no persistence). Each user query becomes two turns: the user's
 * message + the assistant's pending → resolved blocks.
 */
import type { ChatTurn } from './types'
import { routeQuery } from './router'

let nextId = 0
const newId = () => `turn-${++nextId}-${Date.now()}`

export const conversation = $state<{ turns: ChatTurn[]; thinking: boolean }>({
	turns: [],
	thinking: false
})

export function submitQuery(query: string): void {
	const text = query.trim()
	if (!text) return
	conversation.turns.push({
		id: newId(),
		timestamp: Date.now(),
		role: 'user',
		text
	})
	conversation.thinking = true
	// Fake the "model is thinking" delay so the UI gets to show its spinner.
	// The router itself is synchronous.
	setTimeout(() => {
		conversation.turns.push({
			id: newId(),
			timestamp: Date.now(),
			role: 'assistant',
			blocks: routeQuery(text)
		})
		conversation.thinking = false
	}, 350)
}

export function resetConversation(): void {
	conversation.turns = []
	conversation.thinking = false
}
