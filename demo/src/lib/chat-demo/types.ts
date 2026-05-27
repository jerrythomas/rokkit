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

/**
 * Raw markdown content. Rendered via Rokkit's MarkdownRenderer with the
 * full plugin set (plot, table, form, list, stepper, sparkline, mermaid),
 * so any code fences in a recognised language render as the matching live
 * component. This is the canonical shape an LLM emits — markdown is its
 * native output and free models handle it more reliably than strict JSON.
 */
export type MarkdownBlock = {
	kind: 'markdown'
	markdown: string
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

/**
 * Structured error surface. Long upstream error messages used to overflow
 * the prose block; this gives them a dedicated affordance with collapsible
 * details and a copy button.
 */
export type ErrorBlock = {
	kind: 'error'
	title: string
	message: string
	details?: string
	hint?: string
}

/**
 * A suggestion can either (a) be plain text that gets submitted as a new query,
 * or (b) carry a structured action that re-routes the existing data through
 * the inference pipeline with a forced shape. The latter avoids the user
 * pasting data in twice.
 */
export type SuggestionAction =
	| { kind: 'reshape'; source: 'json' | 'csv'; data: unknown; force: 'table' | 'chart' | 'record' | 'list'; caption?: string }
	| { kind: 'props'; tool: string; props: Record<string, unknown>; caption?: string }
	| { kind: 'switch-provider'; provider: 'openrouter' | 'webllm' }

export type SuggestionItem = {
	label: string
	query: string
	action?: SuggestionAction
}

export type SuggestionsBlock = {
	kind: 'suggestions'
	intro?: string
	items: SuggestionItem[]
}

export type Block =
	| ProseBlock
	| MarkdownBlock
	| CodeBlock
	| ComponentBlock
	| SuggestionsBlock
	| DataNoteBlock
	| ErrorBlock

export type ChatTurn = {
	id: string
	timestamp: number
} & (
	| { role: 'user'; text: string }
	| {
			role: 'assistant'
			blocks: Block[]
			pending?: boolean
			/** Who produced this turn — captured at submit time so resume
			 * can restore the toggle. */
			provider?: 'scripted' | 'openrouter' | 'webllm'
			/** Model id for openrouter / webllm (undefined for scripted). */
			model?: string
	  }
)
