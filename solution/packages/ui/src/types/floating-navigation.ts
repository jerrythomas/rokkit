import type { Snippet } from 'svelte'

/**
 * Position on the screen edge
 */
export type FloatingNavigationPosition = 'left' | 'right' | 'top' | 'bottom'

/**
 * Size variant
 */
export type FloatingNavigationSize = 'sm' | 'md' | 'lg'

/**
 * A single navigation item
 */
export type FloatingNavigationItem = Record<string, unknown>

/**
 * Custom snippet for rendering a navigation item
 */
export type FloatingNavigationItemSnippet = Snippet<
	[item: FloatingNavigationItem, proxy: { text: string; icon: string; active: boolean }]
>

/**
 * Props for the FloatingNavigation component
 */
export interface FloatingNavigationProps {
	/** Navigation items (data-driven) */
	items?: FloatingNavigationItem[]

	/** Field mapping configuration */
	fields?: Record<string, string>

	/** Active item value (bindable) */
	value?: unknown

	/** Screen edge to anchor to */
	position?: FloatingNavigationPosition

	/** Whether nav is pinned open (bindable) */
	pinned?: boolean

	/** Auto-track active section via IntersectionObserver */
	observe?: boolean

	/** IntersectionObserver config */
	observerOptions?: IntersectionObserverInit

	/** Size variant */
	size?: FloatingNavigationSize

	/** Accessible label */
	label?: string

	/** Called when an item is selected */
	onselect?: (value: unknown, item: FloatingNavigationItem) => void

	/** Called when pin state changes */
	onpinchange?: (pinned: boolean) => void

	/** Custom snippet for rendering items */
	item?: FloatingNavigationItemSnippet

	/** Additional CSS classes */
	class?: string
}
