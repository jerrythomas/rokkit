import type { Snippet } from 'svelte'

export type ChatRole = 'user' | 'assistant' | 'system'
export type ChatStatus = 'streaming' | 'error' | 'done'

/**
 * A single message in a chat transcript.
 *
 * Also exported as `ChatMessageData`, which is the name consumers should import.
 * The package entry exports a *component* called `ChatMessage` as well, and
 * Svelte's generated component types contribute a type of that name — which
 * shadows this interface, making `ChatMessage<T>` unreachable from outside the
 * package. The alias is the reachable spelling; renaming either the component or
 * this interface is a breaking change, so it waits for a major.
 */
export interface ChatMessage<T = unknown> {
	id: string
	role: ChatRole
	/** Default body, rendered as markdown by the built-in body snippet. */
	text?: string
	timestamp?: string
	/** Drives the optional typing/error affordance; consumer sets it. */
	status?: ChatStatus
	/** Arbitrary payload (parts/blocks/chart spec/form schema) the consumer's `message` snippet reads. */
	data?: T
}

/**
 * Reachable alias for {@link ChatMessage} — see the note on that interface for
 * why the bare name does not survive the package boundary.
 */
export type ChatMessageData<T = unknown> = ChatMessage<T>

export interface ConversationSummary {
	id: string
	title: string
	timestamp?: string
}

export interface ChatMessageProps {
	message: ChatMessage
	relativeTime?: boolean
	body?: Snippet<[ChatMessage]>
	avatar?: Snippet<[ChatMessage]>
	label?: Snippet<[ChatMessage]>
}

export interface ChatComposerProps {
	value?: string
	placeholder?: string
	disabled?: boolean
	busy?: boolean
	onsubmit?: (text: string) => void
	onchange?: (value: string) => void
	suggestions?: Snippet
	toolbar?: Snippet
	leading?: Snippet
}

export interface ChatHistoryProps {
	conversations?: ConversationSummary[]
	activeId?: string | null
	relativeTime?: boolean
	onselect?: (id: string) => void
	onnew?: () => void
	ondelete?: (id: string) => void
	item?: Snippet<[ConversationSummary]>
	empty?: Snippet
	header?: Snippet
}

export interface ChatTimelineProps {
	messages?: ChatMessage[]
	relativeTime?: boolean
	autoscroll?: boolean
	message?: Snippet<[ChatMessage]>
	empty?: Snippet
}

export interface ChatShellProps {
	messages?: ChatMessage[]
	conversations?: ConversationSummary[]
	activeConversationId?: string | null
	value?: string
	placeholder?: string
	busy?: boolean
	onsubmit?: (text: string) => void
	onchange?: (value: string) => void
	onselectConversation?: (id: string) => void
	onnew?: () => void
	message?: Snippet<[ChatMessage]>
	suggestions?: Snippet
	toolbar?: Snippet
	leading?: Snippet
	historyItem?: Snippet<[ConversationSummary]>
	empty?: Snippet
}
