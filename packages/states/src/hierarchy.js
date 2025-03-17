/**
 * @typedef {Object} HierarchyItem
 * @property {number} depth - The depth of the item in the hierarchy.
 * @property {Array<number>} path - The path of the item in the hierarchy.
 * @property {any} item   - The item itself.
 * @property {HierarchyItem} parent - The reference to the parent item.
 */

/**
 * Converts a hierarchy of items into a flat array of objects.
 *ß
 * @param {Array<any>}                         items - The array of items to convert.
 * @param {import('@rokkit/core').FieldMapper} mapping - The field mapper to use for mapping.
 * @param {HierarchyItem}                      parent - The current path of the item.
 * @returns {Array<Object>} - The flat array of objects.
 */
export function flatHierarchy(items, mapping, parent = null) {
	const data = []
	const path = parent?.path ?? []

	items.forEach((item, index) => {
		const props = {
			depth: path.length,
			path: [...path, index],
			item,
			parent
		}

		const children = flatHierarchy(mapping.getChildren(item), mapping, props)
		data.push(props, ...children)
	})

	return data
}

/**
 * Flattens a hierarchy of nodes into a flat array of nodes.
 *
 * @param {import('./node-proxy.svelte.js').NodeProxy[]} nodes - The array of nodes to flatten.
 * @returns
 */
export function flatttenNodeHierarchy(nodes) {
	const flatNodes = []
	nodes.forEach((node) => {
		flatNodes.push(node)
		if (node.children.length > 0 && node.expanded) {
			flatNodes.push(...flatttenNodeHierarchy(node.children))
		}
	})
	return flatNodes
}
