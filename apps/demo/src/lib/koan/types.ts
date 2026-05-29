// demo/src/lib/koan/types.ts
import type { Component } from 'svelte'

export type DemoCategory = 'theme' | 'navigation' | 'feedback' | 'forms' | 'data'

/**
 * JSON-Schema-ish parameter description. Kept loose (Record<string, unknown>)
 * for now; tighten once we feed the LLM real tool definitions and need to
 * match a specific provider's schema (OpenAI / Anthropic / etc.).
 */
export type ToolParamSchema = Record<string, unknown>

/**
 * Tool spec the future LLM will see for this demo. Each demo declares what
 * the model can ask for and what parameters are bounded.
 *
 * The runtime doesn't read this yet — the spec exists so component authors
 * can describe their demo in the same place they declare title / keywords,
 * and so it ships ready when the LLM router lands (see
 * docs/backlog/2026-05-23-interactive-koan-mode.md).
 */
export type DemoTool = {
	/** Tool name as exposed to the LLM (snake_case). */
	name: string
	/** Short description written for the LLM — when to call this tool. */
	description: string
	/** Optional parameter schema; the LLM may pass these props through. */
	parameters?: ToolParamSchema
}

/**
 * Inline rendering capability. If `capable: true`, the demo can be embedded
 * inside a chat message as a small live artifact (alongside prose / code).
 * `propSchema` bounds what the LLM can pass; `defaultProps` is used when
 * the LLM omits a field.
 */
export type DemoInline = {
	capable: boolean
	component?: () => Promise<{ default: Component }>
	propSchema?: ToolParamSchema
	defaultProps?: Record<string, unknown>
}

/**
 * A discoverable variation of a demo — e.g. Tabs with custom snippets,
 * Table with custom field mapping, List with async data. Surfaced by the
 * LLM as follow-up suggestions ("Try this with async data") and routed
 * either dynamically (same page, swap props via URL param) or via a
 * dedicated sub-route. See the interactive-koan-mode backlog draft.
 */
export type DemoVariant = {
	/** Stable id used in URLs and tool calls (e.g. 'snippets', 'mapping'). */
	id: string
	/** Display label for the chat suggestion chip. */
	label: string
	/** How the variant is reached. */
	mode: 'dynamic' | 'route'
	/** Extra props the layout merges into the mounted component. */
	props?: Record<string, unknown>
}

export type DemoMeta = {
	id: string
	title: string
	description: string
	keywords: string[]
	category: DemoCategory
	icon: string
	load: () => Promise<{ default: Component }>
	preview?: () => Promise<{ default: Component }>

	/** LLM-facing tool spec. Optional until the interactive chat lands. */
	tool?: DemoTool
	/** Inline-composition capability. */
	inline?: DemoInline
	/** Discoverable variations of this demo. */
	variants?: DemoVariant[]
}

export type TimelineEntry = {
	demoId: string
	mountedAt: string
	query: string
}

export type UserMessage = {
	kind: 'user'
	id: string
	query: string
	timestamp: string
}

export type ResponseMessage = {
	kind: 'response'
	id: string
	query: string
	matches: string[] // demo ids
	copy: string // "I have a Theme Builder you can try." or "Here are a few options."
	timestamp: string
}

export type ConversationMessage = UserMessage | ResponseMessage

export type WizardMode = 'light' | 'dark' | 'auto'
export type WizardDensity = 'compact' | 'comfortable' | 'cozy'
export type WizardRoundedness = 'sharp' | 'soft' | 'rounded' | 'pill'
export type WizardStyle = 'zen-sumi' | 'rokkit' | 'minimal' | 'material' | 'frosted'

export type WizardState = {
	preset: string
	style: WizardStyle
	mode: WizardMode
	density: WizardDensity
	roundedness: WizardRoundedness
	name: string
}

export type SavedTheme = WizardState & {
	id: string
	createdAt: string
	updatedAt: string
}
