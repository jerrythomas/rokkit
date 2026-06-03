/**
 * TreeTable Component Types
 *
 * Hierarchical analog of Table — accepts nested rows (each row may
 * carry a `children: []` array) and renders the hierarchy in one
 * designated column with chevron + indent + tree connectors.
 *
 * Reuses the column / sort / cell types from Table.
 */

import type { Snippet } from 'svelte'
import type { TableColumn, TableSortIcons, SortState, TableFields } from './table.js'

// =============================================================================
// Column extension
// =============================================================================

/**
 * Column definition for TreeTable — adds an optional `hierarchy` flag
 * to mark which column renders the chevron + indent connectors. When
 * no column is flagged, the first column is treated as the hierarchy
 * column by default.
 */
export interface TreeTableColumn extends TableColumn {
	/** Render chevron + tree connectors in this column. Defaults to the first column. */
	hierarchy?: boolean
}

// =============================================================================
// Snippets
// =============================================================================

export type TreeTableHeaderSnippet = Snippet<[TreeTableColumn[], SortState[]]>
export type TreeTableRowSnippet = Snippet<
	[Record<string, unknown>, TreeTableColumn[], number, boolean]
>
export type TreeTableCellSnippet = Snippet<
	[unknown, TreeTableColumn, Record<string, unknown>]
>
export type TreeTableEmptySnippet = Snippet<[]>

// =============================================================================
// Component Props
// =============================================================================

export interface TreeTableProps {
	/** Nested row data — each row may carry a `children: []` array. */
	data?: Record<string, unknown>[]

	/** Column definitions (auto-derived from the first row if not provided). */
	columns?: TreeTableColumn[]

	/** Currently selected row value (single-select) */
	value?: unknown

	/** Currently selected row values (multi-select, bindable) */
	values?: unknown[]

	/** Selection mode: 'single' (default), 'multi', or false (no selection) */
	selectable?: 'single' | 'multi' | false

	/** Table caption for accessibility */
	caption?: string

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Enable alternating row colors */
	striped?: boolean

	/** Whether the entire table is disabled */
	disabled?: boolean

	/** Tree connector line style — same options as the Tree component */
	lineStyle?: 'none' | 'solid' | 'dashed' | 'dotted'

	/** Row-level field mapping (incl. the `children` field name). */
	fields?: TableFields & { children?: string }

	/** Called when a row is selected */
	onselect?: (value: unknown, row: Record<string, unknown>) => void

	/** Called when sort state changes */
	onsort?: (sortState: SortState[]) => void

	/** Additional CSS classes */
	class?: string

	/** Sort indicator icons */
	icons?: TableSortIcons & { opened?: string; closed?: string }

	/** Custom header snippet */
	header?: TreeTableHeaderSnippet

	/** Custom row snippet */
	row?: TreeTableRowSnippet

	/** Custom cell snippet */
	cell?: TreeTableCellSnippet

	/** Empty state snippet */
	empty?: TreeTableEmptySnippet
}
