import { getKeyFromPath, defaultFields, getNestedFields } from '@rokkit/core'
import { Proxy } from './proxy.svelte'
/**
 *
 * @param {Array<*>} items
 * @param {import('@rokkit/core').FieldMapping} fields
 * @param {Array<number>} path
 * @returns {Array<{ key: string, value: any }>}
 */
export function flatVisibleNodes(items, fields = defaultFields, path = []) {
	const data = []
	items.forEach((item, index) => {
		const itemPath = [...path, index]
		const key = getKeyFromPath(itemPath)
		const expanded =
			Array.isArray(item[fields.children]) &&
			item[fields.children].length > 0 &&
			item[fields.expanded]

		data.push({ key, value: item })

		if (expanded) {
			const childFields = getNestedFields(fields)
			data.push(...flatVisibleNodes(item[fields.children], childFields, itemPath))
		}
	})
	return data
}

/**
 * Derives a flat lookup table for the given items, using index paths as keys
 * Each value is a Proxy instance for convenient manipulation
 *
 * @param {Array<*>} items - Source items array
 * @param {import('@rokkit/core').FieldMapping} fields - Field mappings configuration
 * @param {Array<number>} path - Current path in the tree
 * @returns {Map<string, Proxy>} - Map of path keys to Proxy instances
 */
export function deriveLookupWithProxy(items, fields = defaultFields, path = []) {
	const lookup = new Map()

	items.forEach((item, index) => {
		const itemPath = [...path, index]
		const key = getKeyFromPath(itemPath)
		const proxy = new Proxy(item, fields)

		lookup.set(key, proxy)
		// console.log(key, proxy.value)
		if (proxy.hasChildren) {
			const childFields = getNestedFields(fields)
			const childLookup = deriveLookupWithProxy(proxy.get('children'), childFields, itemPath)
			for (const [childKey, childValue] of childLookup.entries()) {
				lookup.set(childKey, childValue)
			}
		}
	})
	return lookup
}
