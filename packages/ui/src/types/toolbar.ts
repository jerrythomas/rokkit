/**
 * Toolbar Component Types
 *
 * Provides types for the data-driven Toolbar component.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for toolbar data.
 * Maps custom data field names to the component's expected properties.
 */
export interface ToolbarFields {
	/** Field for display text/tooltip - default: 'text' */
	text?: string

	/** Field for the value to emit on click - default: 'value' */
	value?: string

	/** Field for icon class name - default: 'icon' */
	icon?: string

	/** Field for disabled state - default: 'disabled' */
	disabled?: string

	/** Field for active/pressed state - default: 'active' */
	active?: string

	/** Field for item type (button, toggle, separator, spacer, custom) - default: 'type' */
	type?: string

	/** Field for custom snippet name - default: 'snippet' */
	snippet?: string

	/** Field for aria-label override - default: 'label' */
	label?: string

	/** Field for keyboard shortcut display - default: 'shortcut' */
	shortcut?: string
}

/**
 * Default field mapping values
 */
export const defaultToolbarFields: Required<ToolbarFields> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	disabled: 'disabled',
	active: 'active',
	type: 'type',
	snippet: 'snippet',
	label: 'label',
	shortcut: 'shortcut'
}

// =============================================================================
// Toolbar Item Types
// =============================================================================

/**
 * Generic toolbar item - can be any object with mapped fields
 */
export type ToolbarItem = Record<string, unknown>

/**
 * Built-in toolbar item types
 */
export type ToolbarItemType = 'button' | 'toggle' | 'separator' | 'spacer' | 'custom'

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom item snippets
 */
export interface ToolbarItemHandlers {
	/** Call to trigger item action */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering toolbar items
 */
export type ToolbarItemSnippet = import('svelte').Snippet<
	[ToolbarItem, ToolbarFields, ToolbarItemHandlers]
>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Toolbar component
 */
export interface ToolbarProps {
	/** Array of toolbar items */
	items?: ToolbarItem[]

	/** Field mapping configuration */
	fields?: ToolbarFields

	/** Position of toolbar - affects border and sticky positioning */
	position?: 'top' | 'bottom' | 'left' | 'right'

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Whether toolbar should stick to its position */
	sticky?: boolean

	/** Compact mode with reduced padding */
	compact?: boolean

	/** Show dividers between sections */
	showDividers?: boolean

	/** Whether the entire toolbar is disabled */
	disabled?: boolean

	/** Called when an item is clicked */
	onclick?: (value: unknown, item: ToolbarItem) => void

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering toolbar items */
	item?: ToolbarItemSnippet

	/** Slot for start section content */
	start?: import('svelte').Snippet

	/** Slot for center section content */
	center?: import('svelte').Snippet

	/** Slot for end section content */
	end?: import('svelte').Snippet

	/** Default slot for children */
	children?: import('svelte').Snippet
}

/**
 * Props for the ToolbarGroup component
 */
export interface ToolbarGroupProps {
	/** Accessibility label for the group */
	label?: string

	/** Gap between items in the group */
	gap?: 'none' | 'sm' | 'md' | 'lg'

	/** Additional CSS classes */
	class?: string

	/** Group content */
	children?: import('svelte').Snippet
}
