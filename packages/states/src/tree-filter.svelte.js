import { Node } from './node'

/**
 * Filters a tree structure based on a predicate
 * @param {Array} items - The tree data
 * @param {Function} predicate - Filter function that returns boolean
 * @param {FieldMapper} mapper - FieldMapper instance
 * @returns {Array} Filtered tree
 */
export function filterTree(nodes, predicate, mapper) {
	const filterNode = (node) => {
		// If node matches predicate, include it and all its children
		if (predicate(node)) {
			return new Node(node.original, mapper)
		}

		// If node has children, check them
		if (node.children.length > 0) {
			const filteredChildren = node.children.map((child) => filterNode(child)).filter(Boolean)

			if (filteredChildren.length > 0) {
				// Create new node with only matching children
				const filteredData = { ...node.original }
				filteredData[mapper.fields.children] = filteredChildren.map((n) => n.original)
				return new Node(filteredData, mapper)
			}
		}

		return null
	}

	return nodes.map((node) => filterNode(node)).filter(Boolean)
}
