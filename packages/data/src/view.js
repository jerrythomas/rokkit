import { omit } from 'ramda'
import { get, writable } from 'svelte/store'
import { deriveMetadata, deriveSortableColumn } from './infer'

import {
	flattenNestedChildren,
	removeChildren,
	deriveHierarchy,
	toggleExpansion
} from './hierarchy'

/**
 * Sorts a nested array of objects based on a group of sorters.
 *
 * @param {Array<Object>} elements - The array of objects to sort.
 */
function sortNested(elements, group) {
	elements
		.sort((a, b) => {
			let result = 0
			for (let i = 0; i < group.length && result === 0; i++) {
				result = group[i].sorter(a, b)
			}
			return result
		})
		.forEach((x) => {
			if (Array.isArray(x.children) && x.children.length > 0) {
				sortNested(x.children, group)
			}
		})
}

/**
 * Sorts a hierarchy based on a group of sorters.
 *
 * @param {Array<Object>} hierarchy - The hierarchy to sort.
 * @param {Array<Array<string, boolean>>} sortGroup - The group of sorters to apply.
 */
export function groupSort(hierarchy, sortGroup) {
	const group = sortGroup.map(deriveSortableColumn).map(({ name, sorter }) => ({
		name,
		sorter: (a, b) => sorter(a.row[name], b.row[name])
	}))

	removeChildren(hierarchy)
	sortNested(hierarchy, group)
	flattenNestedChildren(hierarchy)
}

/**
 * Sorts the hierarchy based on a specific field name and order.
 *
 * @param {string} name - The field name to sort by.
 * @param {boolean} [ascending=true] - Whether the sort should be in ascending order.
 */
const sortHierarchyBy = (store, sortGroup, name, ascending = true) => {
	sortGroup = [...sortGroup, [name, ascending]]
	// change the sort order in the metadata
	const { columns, hierarchy } = get(store)
	columns.forEach((column) => {
		if (column.name === name) {
			column.order = ascending ? 'ascending' : 'descending'
		}
	})
	groupSort(hierarchy, sortGroup)
	store.set({ columns, hierarchy })
}

/**
 * Updates the selection state for all children of a node in the hierarchy.
 *
 * @param {Array<import('./types').Hierarchy>} hierarchy - The hierarchy to update.
 * @param {number} index - The index of the node to update.
 */
function updateChildren(item) {
	if (!item.children) return

	item.children.forEach((child) => {
		child.selected = item.selected
		updateChildren(child)
	})
}

/**
 * Determines the selected state of a group of children in the hierarchy.
 * If all children are checked, returns 'checked'.
 * If all children are unchecked, returns 'unchecked'.
 * Otherwise, returns 'indeterminate'.
 *
 * @param {Array<Object>} children - The array of child objects with a 'selected' property.
 * @returns {string} The determined selected state: 'checked', 'unchecked', or 'indeterminate'.
 */
export function determineSelectedState(children) {
	const allChecked = children.every((child) => child.selected === 'checked')
	const allUnchecked =
		!allChecked && children.every((child) => !child.selected || child.selected === 'unchecked')

	return allChecked ? 'checked' : allUnchecked ? 'unchecked' : 'indeterminate'
}

/**
 * Updates the selection state of parent nodes in the hierarchy based on their children's states.
 * It traverses up from the provided `index` position in the hierarchy array, ensuring each
 * parent's selected state reflects whether all, none, or some of its children are selected.
 *
 * @param {Array<Object>} hierarchy - The hierarchy structure containing nodes with
 *                                    'parent' and 'children' references.
 * @param {number} index - The index of the node in the hierarchy array from where
 *                         to start updating parent nodes.
 */
function updateParents(item) {
	let parent = item.parent

	while (parent) {
		parent.selected = determineSelectedState(parent.children)
		parent = parent.parent
	}
}

/**
 * Toggles the selection state of a node in the hierarchy.
 * Depending on whether the node to toggle is a parent or child,
 * it will either select or deselect all children, or update the parent's selection state based on its children's states.
 *
 * @param {import('./types').Hierarchy} item - The node to toggle.
 *
 */
export function toggleSelection(item) {
	item.selected = item.selected === 'checked' ? 'unchecked' : 'checked'

	updateParents(item)
	updateChildren(item)
}

/**
 * Toggles the expansion or selection state of a data element at the specified index.
 *
 * @param {import('svelte/store').Writable} store - The store object representing the view.
 * @param {number} index - The index of the element in the hierarchy to expand or collapse.
 * @param {string} mode - The mode to toggle, either 'expansion' or 'selection'.
 */
function toggleState(store, index, mode) {
	const { hierarchy } = get(store)
	if (mode === 'selection') toggleSelection(hierarchy[index])
	else if (mode === 'expansion') toggleExpansion(hierarchy[index])
	store.update((state) => ({ ...state, hierarchy }))
}

/**
 * Creates a view object for managing data presentation with metadata and hierarchy structures,
 * as well as providing methods for sorting, selection, and toggling of data expansion.
 *
 * @param {Array<Object>} data    - The source data array to be presented by the view.
 * @param {Object}        options - The configuration options used for deriving metadata and hierarchy from the data.
 * @returns {import('svelte/store').Writable} An object representing the view, providing methods to manipulate and query the presentation state.
 */
export function dataview(data, options) {
	const store = writable({
		columns: deriveMetadata(data, options),
		hierarchy: deriveHierarchy(data, options)
	})
	let sortGroup = []

	return {
		...omit(['set', 'update'], store),
		// filter: noop,
		/**
		 * Clears the applied sort order from the hierarchy.
		 */
		clearSort: () => {
			sortGroup = []
			store.update((state) => ({
				...state,
				columns: state.columns.map((column) => ({ ...column, order: 'none' }))
			}))
		},
		sortBy: (name, ascending) => sortHierarchyBy(store, sortGroup, name, ascending),
		select: (index) => toggleState(store, index, 'selection'),
		toggle: (index) => toggleState(store, index, 'expansion')
	}
}
