import type { Snippet } from 'svelte'

export type ChatRole = 'user' | 'assistant' | 'system'
export type ChatStatus = 'streaming' | 'error' | 'done'

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
