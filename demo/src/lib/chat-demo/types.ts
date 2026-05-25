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

/**
 * Lightweight metadata about an inference result — what shape we detected,
 * how many rows, columns and their types. Rendered as a small "I see ..."
 * row so the user can sanity-check the inference.
 */
export type DataNoteBlock = {
	kind: 'data-note'
	source: 'json' | 'csv' | 'attached'
	shape: 'record' | 'table' | 'chart' | 'list' | 'json'
	rowCount?: number
	columnCount?: number
	columns?: { name: string; type: string }[]
}

export type SuggestionsBlock = {
	kind: 'suggestions'
	intro?: string
	items: { label: string; query: string }[]
}

export type Block =
	| ProseBlock
	| CodeBlock
	| ComponentBlock
	| SuggestionsBlock
	| DataNoteBlock

export type ChatTurn = {
	id: string
	timestamp: number
} & (
	| { role: 'user'; text: string }
	| { role: 'assistant'; blocks: Block[]; pending?: boolean }
)
