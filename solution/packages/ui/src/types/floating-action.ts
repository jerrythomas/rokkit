import type { Snippet } from 'svelte'

/**
 * Field mapping for FloatingAction items
 */
export type FloatingActionFields = Record<string, string>

/**
 * Default field mappings
 */
export const defaultFloatingActionFields: Required<
	Pick<FloatingActionFields, 'text' | 'value' | 'icon' | 'label' | 'disabled'>
> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	label: 'label',
	disabled: 'disabled'
}

/**
 * A single action item
 */
export type FloatingActionItem = Record<string, unknown>

/**
 * Event handlers passed to custom snippets
 */
export interface FloatingActionItemHandlers {
	onclick: () => void
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Custom snippet for rendering an action item
 */
export type FloatingActionItemSnippet = Snippet<
	[item: FloatingActionItem, fields: FloatingActionFields, handlers: FloatingActionItemHandlers]
>

/**
 * Position options for the FAB
 */
export type FloatingActionPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

/**
 * Expansion direction for action items
 */
export type FloatingActionExpand = 'radial' | 'vertical' | 'horizontal'

/**
 * Alignment for action items in the menu
 */
export type FloatingActionItemAlign = 'start' | 'center' | 'end'

/**
 * Icons for the FloatingAction trigger button
 */
export interface FloatingActionIcons {
	/** Icon for the main trigger (add action) */
	add?: string
	/** Icon shown when menu is open (close action) */
	close?: string
}

/**
 * Props for the FloatingAction component
 */
export interface FloatingActionProps {
	/** Array of action items */
	items?: FloatingActionItem[]

	/** Field mapping configuration */
	fields?: FloatingActionFields

	/** Custom icons for the trigger button */
	icons?: FloatingActionIcons

	/** Accessible label for the trigger */
	label?: string

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Position on screen */
	position?: FloatingActionPosition

	/** How items expand when opened */
	expand?: FloatingActionExpand

	/** Alignment of items in the menu (start/center/end) */
	itemAlign?: FloatingActionItemAlign

	/** Disable the FAB */
	disabled?: boolean

	/** Whether the menu is open (bindable) */
	open?: boolean

	/** Show backdrop overlay when open */
	backdrop?: boolean

	/** Position relative to nearest positioned ancestor instead of viewport */
	contained?: boolean

	/** Called when an action is selected */
	onselect?: (value: unknown, item: FloatingActionItem) => void

	/** Called when menu opens */
	onopen?: () => void

	/** Called when menu closes */
	onclose?: () => void

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering action items */
	item?: FloatingActionItemSnippet
}

// Re-export getSnippet for convenience
export { getSnippet } from './menu.js'
