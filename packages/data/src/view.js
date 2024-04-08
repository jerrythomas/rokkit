import { deriveMetadata, deriveSortableColumn } from './infer'
import {
	flattenNestedChildren,
	removeChildren,
	deriveHierarchy,
	toggleExpansion
} from './hierarchy'

/**
 * Creates a view object for managing data presentation with metadata and hierarchy structures,
 * as well as providing methods for sorting, selection, and toggling of data expansion.
 *
 * @param {Array<Object>} data - The source data array to be presented by the view.
 * @param {Object} options - The configuration options used for deriving metadata and hierarchy from the data.
 * @returns {Object} An object representing the view, providing methods to manipulate and query the presentation state.
 */
export function dataview(data, options) {
	let sortGroup = []

	const metadata = deriveMetadata(data, options)
	const hierarchy = deriveHierarchy(data, options)

	/**
	 * Sorts the hierarchy based on a specific field name and order.
	 *
	 * @param {string} name - The field name to sort by.
	 * @param {boolean} [ascending=true] - Whether the sort should be in ascending order.
	 */
	const sortBy = (name, ascending = true) => {
		sortGroup = [...sortGroup, [name, ascending]]
		groupSort(hierarchy, sortGroup)
	}

	return {
		columns: metadata,
		hierarchy,
		// filter: () => {},
		/**
		 * Clears the applied sort order from the hierarchy.
		 */
		clearSort: () => (sortGroup = []),
		sortBy,
		/**
		 * Toggles the selection state of a data element at the specified index.
		 *
		 * @param {number} index - The index of the element in the hierarchy to select or deselect.
		 */
		select: (index) => toggleSelection(hierarchy[index]),
		/**
		 * Toggles the expansion state of a data element at the specified index.
		 *
		 * @param {number} index - The index of the element in the hierarchy to expand or collapse.
		 */
		toggle: (index) => toggleExpansion(hierarchy[index])
	}
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
