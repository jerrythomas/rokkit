/**
 * Author-name config for the chat surface. Configure once at startup; every
 * <ChatMessage/> in the conversation reads from here when its own `who` prop
 * is unset.
 *
 *   import { who } from '$lib/chat'
 *
 *   // Either mutate directly (re-runs as reactive state):
 *   who.user = 'Jerry'
 *   who.assistant = 'Rokkit'
 *
 *   // Or pass an object via configureWho():
 *   configureWho({ user: 'Jerry', assistant: 'Rokkit' })
 *
 * Defaults are 'you' / 'assistant'. The component still accepts a per-message
 * `who` override for cases where one turn needs a different label.
 */
export const who = $state<{ user: string; assistant: string }>({
	user: 'you',
	assistant: 'assistant'
})

export function configureWho(next: Partial<{ user: string; assistant: string }>): void {
	if (next.user !== undefined) who.user = next.user
	if (next.assistant !== undefined) who.assistant = next.assistant
}
