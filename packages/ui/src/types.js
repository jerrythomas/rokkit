/**
 * @file Base types for @rokkit/ui components
 * All component-specific types should extend from these base types.
 */

// Re-export core types for convenience
/** @typedef {import('@rokkit/core').FieldMapping} FieldMapping */

/**
 * Base props for all data-driven components
 * @typedef {Object} BaseDataProps
 * @property {any[]} [items] - Data array (alias: options)
 * @property {any[]} [options] - Data array (alias: items)
 * @property {FieldMapping} [fields] - Field mapping configuration
 * @property {string} [class] - CSS class names
 */

/**
 * Base props for selection components
 * @typedef {Object} BaseSelectionProps
 * @property {any} [value] - Selected value (single selection)
 * @property {any[]} [selected] - Selected values (multi selection)
 * @property {string} [name] - Component name for forms/accessibility
 * @property {number} [tabindex] - Tab index for keyboard navigation
 * @property {boolean} [disabled] - Whether component is disabled
 */

/**
 * Combined props for data-driven selection components
 * @typedef {BaseDataProps & BaseSelectionProps} DataSelectionProps
 */

/**
 * Props for components with open/close state (dropdowns, accordions, etc.)
 * @typedef {Object} OpenStateProps
 * @property {boolean} [open] - Whether the component is open
 * @property {'up' | 'down' | 'auto'} [direction] - Direction for dropdown opening ('auto' detects viewport space)
 */

/**
 * Props for searchable/filterable components (built-in to Select/MultiSelect)
 * @typedef {Object} SearchableProps
 * @property {boolean} [searchable] - Whether search is enabled
 * @property {string} [searchText] - Current search text
 * @property {string} [searchPlaceholder] - Placeholder for search input
 * @property {(item: any, searchText: string) => boolean} [filterFn] - Custom filter function
 */

/**
 * SearchFilter component props (standalone filter for List/Tree)
 * @typedef {Object} SearchFilterProps
 * @property {string} [class] - CSS class names
 * @property {any[]} [items] - Input data array to filter
 * @property {any[]} [filtered] - Output filtered array (bindable)
 * @property {FieldMapping} [fields] - Field mapping configuration
 * @property {string} [searchText] - Current search text (bindable)
 * @property {string} [placeholder] - Placeholder text for search input
 * @property {(item: any, searchText: string) => boolean} [filterFn] - Custom filter function
 * @property {boolean} [caseSensitive] - Whether search is case sensitive
 * @property {import('svelte').Snippet} [children] - Child content (usually List/Tree)
 */

/**
 * Props for components with placeholder text
 * @typedef {Object} PlaceholderProps
 * @property {string} [placeholder] - Placeholder text when no value selected
 */

/**
 * Event callback types
 * @typedef {(value: any) => void} SelectCallback
 * @typedef {(value: any) => void} ChangeCallback
 * @typedef {(direction: 'up' | 'down') => void} MoveCallback
 */

/**
 * Event handlers for selection components
 * @typedef {Object} SelectionEventHandlers
 * @property {SelectCallback} [onselect] - Called when item is selected
 * @property {ChangeCallback} [onchange] - Called when value changes
 * @property {MoveCallback} [onmove] - Called when navigation occurs
 */

/**
 * Snippet props for customization
 * @typedef {Object} ListSnippetProps
 * @property {import('svelte').Snippet} [header] - Header snippet
 * @property {import('svelte').Snippet} [footer] - Footer snippet
 * @property {import('svelte').Snippet} [empty] - Empty state snippet
 * @property {import('svelte').Snippet<[import('@rokkit/states').Proxy]>} [child] - Custom item renderer
 */

/**
 * Full List component props
 * @typedef {DataSelectionProps & SelectionEventHandlers & ListSnippetProps & {
 *   multiSelect?: boolean,
 *   hierarchy?: any[]
 * }} ListProps
 */

/**
 * Full Select component props
 * @typedef {DataSelectionProps & SelectionEventHandlers & PlaceholderProps & OpenStateProps & SearchableProps & {
 *   currentItem?: import('svelte').Snippet<[any, FieldMapping]>
 * }} SelectProps
 */

/**
 * Full MultiSelect component props
 * @typedef {DataSelectionProps & SelectionEventHandlers & PlaceholderProps & SearchableProps & {
 *   value?: any[],
 *   onremove?: (item: any) => void
 * }} MultiSelectProps
 */

/**
 * Tabs component props
 * @typedef {DataSelectionProps & SelectionEventHandlers & {
 *   children?: import('svelte').Snippet,
 *   orientation?: 'horizontal' | 'vertical'
 * }} TabsProps
 */

/**
 * Switch component props
 * @typedef {BaseDataProps & SelectionEventHandlers & {
 *   value?: any,
 *   allowDeselect?: boolean
 * }} SwitchProps
 */

/**
 * RadioGroup component props
 * @typedef {DataSelectionProps & SelectionEventHandlers & {
 *   orientation?: 'horizontal' | 'vertical'
 * }} RadioGroupProps
 */

/**
 * Tree/hierarchical component props
 * @typedef {DataSelectionProps & SelectionEventHandlers & ListSnippetProps & {
 *   expanded?: any[],
 *   onexpand?: (node: any) => void,
 *   oncollapse?: (node: any) => void
 * }} TreeProps
 */

/**
 * Panel container component props
 * @typedef {Object} PanelProps
 * @property {string} [class] - CSS class names
 * @property {import('svelte').Snippet} [header] - Header section snippet
 * @property {import('svelte').Snippet} [body] - Body section snippet
 * @property {import('svelte').Snippet} [footer] - Footer section snippet
 * @property {import('svelte').Snippet} [children] - Default slot (used as body if body not provided)
 */

// ============================================
// Existing types (preserved from original)
// ============================================

/**
 * @typedef {Object} NodeStateIcons
 * @property {string} opened
 * @property {string} closed
 */

/**
 * @typedef {'empty'|'last'|'child'|'sibling'} ConnectionType
 */

export default {}
