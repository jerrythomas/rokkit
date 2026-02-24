/**
 * SearchFilter Component Types
 *
 * Provides types for the standalone SearchFilter component.
 * Parses user input into structured filter objects using parseFilters() from @rokkit/data.
 */

// =============================================================================
// Filter Types
// =============================================================================

/**
 * A parsed filter condition.
 */
export interface FilterObject {
	/** Column to filter (undefined = search all columns) */
	column?: string

	/** Comparison operator */
	operator: string

	/** Filter value */
	value: string | number | RegExp
}

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Snippet for custom filter tag rendering.
 * Parameters: filter, remove callback
 */
export type SearchFilterTagSnippet = import('svelte').Snippet<[FilterObject, () => void]>

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the SearchFilter component.
 */
export interface SearchFilterProps {
	/** Parsed filter array (bindable) */
	filters?: FilterObject[]

	/** Debounce delay in ms — default: 300 */
	debounce?: number

	/** Input placeholder text */
	placeholder?: string

	/** Column name hints for autocomplete (future use) */
	columns?: string[]

	/** Called when filters change */
	onfilter?: (filters: FilterObject[]) => void

	/** Additional CSS classes */
	class?: string

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Custom filter tag snippet */
	tag?: SearchFilterTagSnippet
}
