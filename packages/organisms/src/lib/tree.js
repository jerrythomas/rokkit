import { defaultFields } from '@rokkit/core'

/**
 * Adds a root node to the items array converting it into a nested tree with one root node
 *
 * @param {Array<Object>} items
 * @param {string} root
 * @param {import('@rokkit/core').FieldMapping} fields
 * @returns
 */
export function addRootNode(items, root = '/', fields = defaultFields) {
	if (Array.isArray(items) && items.length > 1 && root) {
		if (items.length > 1)
			return [
				{
					[fields.text]: root,
					[fields.isOpen]: true,
					[fields.children]: items
				}
			]
	}
	return items
}

/**
 * converts a flat array of items into a tree table structure using one of the columns as the path
 * @param {Array<Object>} items
 * @param {string} path
 * @param {Array<string|Column} columns
 * @param {boolean} multiselect
 * @param {string}  filter
 * @returns {TreeDableData}
 */
