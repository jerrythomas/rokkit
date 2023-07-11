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
	if (Array.isArray(items) && items.length > 0) {
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
