/**
 * Table Component Types
 *
 * Provides types for the data-driven Table component.
 * Supports flat tables with sortable columns, row selection, and keyboard navigation.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states per cell.
 */

import { DEFAULT_STATE_ICONS } from '@rokkit/core'

// =============================================================================
// Column Types
// =============================================================================

/**
 * Column definition for the Table component.
 * Can be auto-derived from data or provided explicitly.
 */
export interface TableColumn {
	/** Data key for this column */
	name: string

	/** Display header text (defaults to name) */
	label?: string

	/** Data type (auto-derived: 'string', 'number', etc.) */
	type?: string

	/** Whether this column is sortable — default: true */
	sortable?: boolean

	/** Current sort direction */
	sorted?: 'none' | 'ascending' | 'descending'

	/** CSS width (e.g., '200px', '20%') */
	width?: string

	/** Text alignment */
	align?: 'left' | 'center' | 'right'

	/** Field mapping — maps ProxyItem slots to data keys */
	fields?: {
		text?: string
		icon?: string
		badge?: string
		description?: string
	}

	/** Value formatter for display */
	formatter?: (value: unknown, row: Record<string, unknown>) => string

	/** Icon formatter — transforms icon field value to icon class */
	iconFormatter?: (value: unknown) => string

	/** Named snippet for custom cell rendering */
	snippet?: string
}

// =============================================================================
// Sort Types
// =============================================================================

/**
 * Represents the sort state for a single column.
 */
export interface SortState {
	/** Column name */
	column: string

	/** Sort direction */
	direction: 'ascending' | 'descending'
}

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Row-level field mapping configuration.
 */
export interface TableFields {
	/** Field for row value used in selection matching — default: 'id' */
	value?: string

	/** Field for disabled state — default: 'disabled' */
	disabled?: string
}

/**
 * Default row-level field mapping values.
 */
export const defaultTableFields: Required<TableFields> = {
	value: 'id',
	disabled: 'disabled'
}

// =============================================================================
// Sort Icons
// =============================================================================

/**
 * Icons for sort state indicators.
 */
export interface TableSortIcons {
	/** Icon for unsorted column */
	none?: string

	/** Icon for ascending sort */
	ascending?: string

	/** Icon for descending sort */
	descending?: string
}

/**
 * Default sort icons from @rokkit/core state icons.
 */
export const defaultTableSortIcons: TableSortIcons = {
	none: DEFAULT_STATE_ICONS.sort.none,
	ascending: DEFAULT_STATE_ICONS.sort.ascending,
	descending: DEFAULT_STATE_ICONS.sort.descending
}

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Snippet for custom header rendering.
 * Parameters: columns, sortState
 */
export type TableHeaderSnippet = import('svelte').Snippet<[TableColumn[], SortState[]]>

/**
 * Snippet for custom row rendering.
 * Parameters: row, columns, index, isSelected
 */
export type TableRowSnippet = import('svelte').Snippet<
	[Record<string, unknown>, TableColumn[], number, boolean]
>

/**
 * Snippet for custom cell rendering.
 * Parameters: value, column, row
 */
export type TableCellSnippet = import('svelte').Snippet<
	[unknown, TableColumn, Record<string, unknown>]
>

/**
 * Snippet for empty state.
 */
export type TableEmptySnippet = import('svelte').Snippet<[]>

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the Table component.
 */
export interface TableProps {
	/** Data array — each object is a row */
	data?: Record<string, unknown>[]

	/** Column definitions (auto-derived from data if not provided) */
	columns?: TableColumn[]

	/** Currently selected row value */
	value?: unknown

	/** Table caption for accessibility */
	caption?: string

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Enable alternating row colors */
	striped?: boolean

	/** Whether the entire table is disabled */
	disabled?: boolean

	/** Row-level field mapping */
	fields?: TableFields

	/** Called when a row is selected */
	onselect?: (value: unknown, row: Record<string, unknown>) => void

	/** Called when sort state changes */
	onsort?: (sortState: SortState[]) => void

	/** Additional CSS classes */
	class?: string

	/** Sort indicator icons */
	icons?: TableSortIcons

	/** Custom header snippet */
	header?: TableHeaderSnippet

	/** Custom row snippet */
	row?: TableRowSnippet

	/** Custom cell snippet */
	cell?: TableCellSnippet

	/** Empty state snippet */
	empty?: TableEmptySnippet
}
