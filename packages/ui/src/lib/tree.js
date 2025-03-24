import { defaultMapping } from '../constants'

/**
 * Adds a root node to the items array converting it into a nested tree with one root node
 *
 * @param {Array<Object>} items
 * @param {string} root
 * @param {import('@rokkit/core').FieldMapping} fields
 * @returns
 */
export function addRootNode(items, root = '/', mapping = defaultMapping) {
	if (items.length > 1 && root) {
		return [
			{
				[mapping.fields.text]: root,
				[mapping.fields.expanded]: true,
				[mapping.fields.children]: items
			}
		]
	}
	return items
}
