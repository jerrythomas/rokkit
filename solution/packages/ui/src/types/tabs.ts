/**
 * Tabs Component Types
 *
 * Provides types for the data-driven Tabs component.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

// =============================================================================
// Tabs Item Types
// =============================================================================

/**
 * Generic tab item - can be any object with mapped fields
 */
export type TabsItem = Record<string, unknown>

// =============================================================================
// Legacy types — kept for backward compat until usages are updated
// =============================================================================

/** @deprecated No longer needed — Navigator handles clicks via data-path */
export interface TabsItemHandlers {
	/** Call to trigger tab selection */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/** @deprecated Use TabsItemSnippet (new ProxyItem API) */
export type LegacyTabsItemSnippet = Snippet<
	[TabsItem, Record<string, string>, TabsItemHandlers, boolean]
>

/** @deprecated Use TabsPanelSnippet (new ProxyItem API) */
export type LegacyTabsPanelSnippet = Snippet<[TabsItem, Record<string, string>]>

// =============================================================================
// Snippet Types — ProxyItem-based API
// =============================================================================

/**
 * Snippet type for rendering tab triggers (headers).
 * The component renders the focusable wrapper; the snippet renders the inner content.
 * Navigator handles click selection via data-path — no handlers needed in snippet.
 * Receives the ProxyItem and whether this item is currently selected.
 */
export type TabsItemSnippet = Snippet<[ProxyItem, boolean]>

/**
 * Snippet type for rendering tab panel content.
 */
export type TabsPanelSnippet = Snippet<[ProxyItem]>

/**
 * Snippet type for rendering the empty state.
 */
export type TabsEmptySnippet = Snippet<[]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Tabs component
 */
export interface TabsProps {
	/** Array of tab options */
	options?: TabsItem[]

	/** Field mapping — overrides PROXY_ITEM_FIELDS defaults (text → 'label', value → 'value', …) */
	fields?: Record<string, string>

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

	/** Called when a tab is selected (fires on every click, including same tab) */
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
