/**
 * Author-name config for the chat surface. Configure once at startup; every
 * <ChatMessage/> in the conversation reads from here when its own `who` prop
 * is unset.
 *
 *   import { configureWho } from '$lib/chat'
 *   configureWho({ assistant: 'Rokkit' })   // user stays the default 'you'
 *
 * Defaults are canonical lowercase names ('you' / 'assistant'). Visual
 * casing is the theme's call via CSS (`[data-koanchat-message-head]` defaults
 * to `text-transform: uppercase`). ChatMessage shows a single label per
 * turn — either the per-message `head` (status badges like "MOUNTED" /
 * "EXPLAINED") or this `who` value, in that order.
 */
export const who = $state<{ user: string; assistant: string }>({
	user: 'you',
	assistant: 'assistant'
})

export function configureWho(next: Partial<{ user: string; assistant: string }>): void {
	if (next.user !== undefined) who.user = next.user
	if (next.assistant !== undefined) who.assistant = next.assistant
}
