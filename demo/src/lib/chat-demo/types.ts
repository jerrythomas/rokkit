/**
 * Inline chat-response block types.
 *
 * A response message is an ordered list of blocks. The renderer walks the
 * list and picks a component per `kind`. This shape is what the (eventually)
 * LLM will produce — the mock router returns the same shape today so the UI
 * doesn't change when we swap in a real model.
 */

export type ProseBlock = {
	kind: 'prose'
	text: string
}

export type CodeBlock = {
	kind: 'code'
	language: string
	code: string
	filename?: string
}

export type ComponentBlock = {
	kind: 'component'
	tool: string
	props: Record<string, unknown>
	caption?: string
}

export type SuggestionsBlock = {
	kind: 'suggestions'
	intro?: string
	items: { label: string; query: string }[]
}

export type Block = ProseBlock | CodeBlock | ComponentBlock | SuggestionsBlock

export type ChatTurn = {
	id: string
	timestamp: number
} & (
	| { role: 'user'; text: string }
	| { role: 'assistant'; blocks: Block[]; pending?: boolean }
)
