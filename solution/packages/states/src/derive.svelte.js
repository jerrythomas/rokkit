import { getKeyFromPath, DEFAULT_FIELDS, getNestedFields } from '@rokkit/core'
/**
 *
 * @param {Array<*>} items
 * @param {import('@rokkit/core').FieldMapping} fields
 * @param {Array<number>} path
 * @param {Set<string>|null} expandedKeys - When provided, expansion is determined by key membership; falls back to item field
 * @returns {Array<{ key: string, value: any, level: number, hasChildren: boolean }>}
 */
export function flatVisibleNodes(items, fields = DEFAULT_FIELDS, path = [], expandedKeys = null) {
	const data = []
	if (!items || !Array.isArray(items)) return data

	const level = path.length

	items.forEach((item, index) => {
		const itemPath = [...path, index]
		const key = getKeyFromPath(itemPath)
		const hasChildren =
			Array.isArray(item[fields.children]) && item[fields.children].length > 0
		const expanded = hasChildren && (expandedKeys ? expandedKeys.has(key) : item[fields.expanded])

		data.push({ key, value: item, level, hasChildren })

		if (expanded) {
			const childFields = getNestedFields(fields)
			data.push(...flatVisibleNodes(item[fields.children], childFields, itemPath, expandedKeys))
		}
	})
	return data
}

/**
 * Derives a flat lookup table for the given items, using index paths as keys.
 * Each value is a lightweight wrapper exposing the original item as both
 * `.value` and `.original` for backward compatibility, plus a `.get(field)`
 * method that reads from the item via field mapping.
 *
 * @param {Array<*>} items - Source items array
 * @param {import('@rokkit/core').FieldMapping} fields - Field mappings configuration
 * @param {Array<number>} path - Current path in the tree
 * @returns {Map<string, { value: *, original: *, label: string, get: (f: string) => * }>}
 */
export function deriveLookupWithProxy(items, fields = DEFAULT_FIELDS, path = []) {
	const lookup = new Map()
	if (!items || !Array.isArray(items)) return lookup

	items.forEach((item, index) => {
		const itemPath = [...path, index]
		const key = getKeyFromPath(itemPath)
		const norm = typeof item === 'object' && item !== null ? item : { [fields.text]: item }
		const entry = {
			value: item,
			original: item,
			label: String(norm[fields.text] ?? ''),
			get: (fieldName) => norm[fields[fieldName] ?? fieldName]
		}

		lookup.set(key, entry)
		const children = norm[fields.children] ?? []
		if (Array.isArray(children) && children.length > 0) {
			const childFields = getNestedFields(fields)
			const childLookup = deriveLookupWithProxy(children, childFields, itemPath)
			for (const [childKey, childValue] of childLookup.entries()) {
				lookup.set(childKey, childValue)
			}
		}
	})
	return lookup
}
