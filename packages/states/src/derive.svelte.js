import { getKeyFromPath, defaultFields, getNestedFields } from '@rokkit/core'

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
 * Derives a flat lookup table for the given items, using the index path as key
 *
 * @param {Array<*>} items
 * @param {import('@rokkit/core').FieldMapping} fields
 * @param {Array<number>} path
 * @returns {Record<string, { depth: number, item: any }>}
 */
export function deriveLookup(items, fields = defaultFields, path = []) {
	const lookup = {}

	items.forEach((item, index) => {
		const itemPath = [...path, index]
		const key = getKeyFromPath(itemPath)

		lookup[key] = { depth: itemPath.length - 1, value: item }
		const hasChildren =
			typeof item === 'object' &&
			Array.isArray(item[fields.children]) &&
			item[fields.children].length > 0

		if (hasChildren) {
			const childFields = getNestedFields(fields)
			const result = deriveLookup(item[fields.children], childFields, itemPath)
			Object.assign(lookup, result)
		}
	})
	return lookup
}
