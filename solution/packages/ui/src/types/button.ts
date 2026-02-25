/**
 * Button Component Types
 *
 * Provides types for the Button and ButtonGroup components.
 * Supports variants, styles, sizes, loading state, link buttons, and custom content.
 */

import type { Snippet } from 'svelte'

// =============================================================================
// Variant & Style Types
// =============================================================================

/** Semantic color variant */
export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'danger'

/** Visual style treatment */
export type ButtonStyle = 'default' | 'outline' | 'ghost'

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Button component
 */
export interface ButtonProps {
	/** Semantic color variant */
	variant?: ButtonVariant

	/** Visual style treatment */
	style?: ButtonStyle

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** HTML button type */
	type?: 'button' | 'submit' | 'reset'

	/** Button label text */
	label?: string

	/** Leading icon class */
	icon?: string

	/** Trailing icon class */
	iconRight?: string

	/** Navigates as link instead of button */
	href?: string

	/** Link target (when href is set) */
	target?: string

	/** Disabled state */
	disabled?: boolean

	/** Loading state — shows spinner, disables interaction */
	loading?: boolean

	/** Additional CSS classes */
	class?: string

	/** Click handler */
	onclick?: (event: MouseEvent) => void

	/** Custom content snippet */
	children?: Snippet
}

/**
 * Props for the ButtonGroup component
 */
export interface ButtonGroupProps {
	/** Size applied to all buttons in the group */
	size?: 'sm' | 'md' | 'lg'

	/** Additional CSS classes */
	class?: string

	/** Content snippet (buttons) */
	children?: Snippet
}
