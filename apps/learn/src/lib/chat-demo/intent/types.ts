/* The contract between whatever understands a message (local search, System One, an LLM) and
 * the chat that acts on it. An interpreter only ever returns an `Interpretation`; `validate`
 * checks it against the catalogue and `act` turns it into the reply.
 */

export type Intent = 'show' | 'modify' | 'reshape' | 'explain' | 'clarify'

/** The views a dataset can take — each is a demo with data (`table`, `chart`, `list`, `form`). */
export type View = 'table' | 'chart' | 'list' | 'form'
export const VIEWS: readonly View[] = ['table', 'chart', 'list', 'form']

export type Interpretation = {
	intent: Intent
	/** A catalogue demo id. */
	demo?: string
	/** One of that demo's variants. */
	variant?: string
	/** Props, checked against the demo's prop schema. */
	props?: Record<string, unknown>
	/** For `reshape`. */
	view?: View
	/** For `explain`: what to look up in the demo's docs. */
	topic?: string
	/** 0–1. Below `CLARIFY_BELOW` the chat asks back instead of acting. */
	confidence: number
	/** For `clarify`: the readings to offer as chips. */
	options?: Interpretation[]
	/** The chip text when this interpretation is offered as a choice. */
	label?: string
}

/** What is on screen: the last `demo` block of the conversation. */
export type Screen = {
	demo: string
	variant?: string
	props: Record<string, unknown>
	data?: unknown
}
