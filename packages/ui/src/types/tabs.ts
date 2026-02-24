/**
 * Tabs Component Types
 *
 * Provides types for the data-driven Tabs component.
 * Field mapping and data access is handled by ItemProxy.
 */

import type { ItemFields } from './item-proxy.js'

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for tabs data.
 * Extends standard item fields with a content field for tab panels.
 */
export interface TabsFields extends ItemFields {
	/** Field for tab panel content - default: 'content' */
	content?: string
}

// =============================================================================
// Tabs Item Types
// =============================================================================

/**
 * Generic tab item - can be any object with mapped fields
 */
export type TabsItem = Record<string, unknown>

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom tab item snippets
 */
export interface TabsItemHandlers {
	/** Call to trigger tab selection */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering tab triggers (headers).
 */
export type TabsItemSnippet = import('svelte').Snippet<
	[TabsItem, TabsFields, TabsItemHandlers, boolean]
>

/**
 * Snippet type for rendering tab panel content.
 */
export type TabsPanelSnippet = import('svelte').Snippet<[TabsItem, TabsFields]>

/**
 * Snippet type for rendering the empty state.
 */
export type TabsEmptySnippet = import('svelte').Snippet<[]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Tabs component
 */
export interface TabsProps {
	/** Array of tab options */
	options?: TabsItem[]

	/** Field mapping configuration */
	fields?: TabsFields

	/** Currently selected tab value */
	value?: unknown

	/** Orientation of the tab list */
	orientation?: 'horizontal' | 'vertical'

	/** Position of the tab list relative to panels */
	position?: 'before' | 'after'

	/** Alignment of tabs within the tab list */
	align?: 'start' | 'center' | 'end'

	/** Accessible name for the tab list */
	name?: string

	/** Whether tabs can be added/removed */
	editable?: boolean

	/** Placeholder text when no tab is selected */
	placeholder?: string

	/** Whether the entire tab component is disabled */
	disabled?: boolean

	/** Additional CSS classes */
	class?: string

	/** Called when selection changes */
	onchange?: (value: unknown, item: TabsItem) => void

	/** Called when a tab is selected */
	onselect?: (value: unknown, item: TabsItem) => void

	/** Called when a new tab is requested (editable mode) */
	onadd?: () => void

	/** Called when a tab removal is requested (editable mode) */
	onremove?: (value: unknown) => void

	/** Custom snippet for rendering tab triggers */
	tabItem?: TabsItemSnippet

	/** Custom snippet for rendering tab panel content */
	tabPanel?: TabsPanelSnippet

	/** Custom snippet for rendering the empty state */
	empty?: TabsEmptySnippet
}
