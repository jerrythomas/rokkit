/**
 * Tree Component Types
 *
 * Provides types for the data-driven Tree component.
 * Supports hierarchical data with expand/collapse, tree lines, and custom icons.
 * Field mapping and data access is handled by ItemProxy.
 */

import type { Snippet } from 'svelte'
import type { ItemProxy, ItemFields } from './item-proxy.js'

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for tree data.
 * Extends ItemFields with tree-specific fields.
 */
export interface TreeFields extends ItemFields {
	/** Field for expanded state - default: 'expanded' */
	expanded?: string

	/** Field for node level/depth - default: 'level' */
	level?: string
}

/**
 * Default field mapping values for tree
 */
export const defaultTreeFields: Required<Omit<TreeFields, 'fields'>> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	description: 'description',
	shortcut: 'shortcut',
	label: 'label',
	disabled: 'disabled',
	active: 'active',
	type: 'type',
	children: 'children',
	snippet: 'snippet',
	href: 'href',
	badge: 'badge',
	expanded: 'expanded',
	level: 'level'
}

// =============================================================================
// Tree Item Types
// =============================================================================

/**
 * Generic tree item - can be any object with mapped fields
 */
export type TreeItem = Record<string, unknown>

// =============================================================================
// Tree Line/Connector Types
// =============================================================================

/**
 * Types of tree line connectors
 */
export type TreeLineType = 'child' | 'last' | 'sibling' | 'empty' | 'icon'

/**
 * Connector types (without 'icon' which is handled separately)
 */
export type ConnectorType = 'child' | 'last' | 'sibling' | 'empty'

/**
 * Icons configuration for tree expand/collapse states
 */
export interface TreeStateIcons {
	/** Icon class for expanded/opened state - default: 'i-lucide:chevron-down' */
	expanded?: string
	/** Icon class for collapsed/closed state - default: 'i-lucide:chevron-right' */
	collapsed?: string
	/** Icon class for leaf nodes (no children) - default: undefined (no icon) */
	leaf?: string
}

/**
 * Default state icons
 */
export const defaultTreeStateIcons: TreeStateIcons = {
	expanded: 'i-lucide:chevron-down',
	collapsed: 'i-lucide:chevron-right',
	leaf: undefined
}

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom item snippets
 */
export interface TreeItemHandlers {
	/** Call to trigger item selection */
	onclick: () => void
	/** Call to toggle expand/collapse */
	ontoggle: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering tree nodes.
 * Parameters: item, fields, handlers, isActive, isExpanded, level
 */
export type TreeItemSnippet = Snippet<
	[TreeItem, TreeFields, TreeItemHandlers, boolean, boolean, number]
>

/**
 * Snippet type for rendering the expand/collapse icon
 * Parameters: isExpanded, hasChildren, icons
 */
export type TreeToggleSnippet = Snippet<[boolean, boolean, TreeStateIcons]>

/**
 * Snippet type for rendering tree line connectors
 * Parameters: lineType
 */
export type TreeConnectorSnippet = Snippet<[TreeLineType]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Tree component
 */
export interface TreeProps {
	/** Array of tree items (hierarchical) */
	items?: TreeItem[]

	/** Field mapping configuration */
	fields?: TreeFields

	/** Currently selected value */
	value?: unknown

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Whether to show tree lines/connectors */
	showLines?: boolean

	/** Which nodes are expanded (bindable) - keyed by node value */
	expanded?: Record<string, boolean>

	/** Expand all nodes by default */
	expandAll?: boolean

	/** Active item value - Tree looks up item by this value to highlight it */
	active?: unknown

	/** Icons for expand/collapse states */
	icons?: TreeStateIcons

	/** Called when an item is selected */
	onselect?: (value: unknown, item: TreeItem) => void

	/** Called when expanded state changes */
	onexpandedchange?: (expanded: Record<string, boolean>) => void

	/** Called when a node is toggled */
	ontoggle?: (value: unknown, item: TreeItem, isExpanded: boolean) => void

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering tree items */
	item?: TreeItemSnippet

	/** Custom snippet for rendering expand/collapse toggle */
	toggle?: TreeToggleSnippet

	/** Custom snippet for rendering tree line connectors */
	connector?: TreeConnectorSnippet
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Mapping for calculating next line type based on parent type
 * Based on @rokkit/core connector implementation
 */
const nextLineType: Record<TreeLineType, TreeLineType> = {
	child: 'sibling',
	last: 'empty',
	sibling: 'sibling',
	empty: 'empty',
	icon: 'empty'
}

/**
 * Constructs an array of line types for tree visualization.
 * This determines what connectors to show at each depth level.
 *
 * Algorithm from @rokkit/core getLineTypes:
 * - For all but the last parent type, convert to continuation type
 * - For the last parent type, use the current node's position
 * - Append 'icon' for nodes with children, 'empty' for leaf nodes
 *
 * @param hasChildren - Whether the node has children
 * @param parentTypes - Line types from parent nodes
 * @param position - Current position type ('child' or 'last')
 * @returns Array of line types for rendering connectors
 */
export function getLineTypes(
	hasChildren: boolean = false,
	parentTypes: TreeLineType[] = [],
	position: 'child' | 'last' = 'child'
): TreeLineType[] {
	const result = parentTypes.reduce<TreeLineType[]>((acc, type, index) => {
		// For all but the last parent type, convert to next type
		// 'child' -> 'sibling' (vertical line continues)
		// 'last' -> 'empty' (no line, branch ended)
		if (index < parentTypes.length - 1) {
			return [...acc, nextLineType[type]]
		}
		// For the last parent type, use the current node's position
		return [...acc, position]
	}, [])

	// Append icon slot for expandable nodes, empty for leaf nodes
	return result.concat(hasChildren ? 'icon' : 'empty')
}

// Keep old name as alias for backward compatibility
export const getTreeLineTypes = getLineTypes

/**
 * Get the key for a node (for expanded state tracking)
 */
export function getNodeKey(proxy: ItemProxy): string {
	const val = proxy.itemValue
	return typeof val === 'string' || typeof val === 'number' ? String(val) : proxy.text
}

export { getSnippet } from './menu.js'
