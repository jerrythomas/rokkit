import { getKeyFromPath, DEFAULT_FIELDS, getNestedFields } from '@rokkit/core'
import { SvelteMap } from 'svelte/reactivity'

/**
 * @param {*} item
 * @param {import('@rokkit/core').FieldMapping} fields
 * @param {string} key
 * @param {Set<string>|null} expandedKeys
 * @returns {boolean}
 */
function isExpanded(item, fields, key, expandedKeys) {
	const hasChildren = Array.isArray(item[fields.children]) && item[fields.children].length > 0
	if (!hasChildren) return false
	return expandedKeys ? expandedKeys.has(key) : item[fields.expanded]
}

/**
 * @param {Array<*>} data  Accumulator array
 * @param {{ item: *, index: number, fields: *, path: Array<number>, level: number, expandedKeys: Set<string>|null }} ctx
 */
function visitNode(data, ctx) {
	const { item, index, fields, path, level, expandedKeys } = ctx
	const itemPath = [...path, index]
	const key = getKeyFromPath(itemPath)
	const hasChildren = Array.isArray(item[fields.children]) && item[fields.children].length > 0
	data.push({ key, value: item, level, hasChildren })
	if (isExpanded(item, fields, key, expandedKeys)) {
		data.push(...flatVisibleNodes(item[fields.children], getNestedFields(fields), itemPath, expandedKeys))
	}
}

/**
 * @param {Array<*>} items
 * @param {import('@rokkit/core').FieldMapping} fields
 * @param {Array<number>} path
 * @param {Set<string>|null} expandedKeys
 * @returns {Array}
 */
function collectVisibleNodes(items, fields, path, expandedKeys) {
	const data = []
	const level = path.length
	for (let i = 0; i < items.length; i++) {
		visitNode(data, { item: items[i], index: i, fields, path, level, expandedKeys })
	}
	return data
}

// eslint-disable-next-line complexity
export function flatVisibleNodes(items, fields = DEFAULT_FIELDS, path = [], expandedKeys = null) {
	if (!items || !Array.isArray(items)) return []
	return collectVisibleNodes(items, fields, path, expandedKeys)
}

/**
 * Merge child lookup entries into parent lookup.
 * @param {SvelteMap} lookup
 * @param {SvelteMap} childLookup
 */
function mergeChildLookup(lookup, childLookup) {
	for (const [childKey, childValue] of childLookup.entries()) {
		lookup.set(childKey, childValue)
	}
}

/**
 * Create a lookup entry for an item.
 * @param {*} item
 * @param {*} norm  Normalised item object
 * @param {*} fields
 * @returns {object}
 */
function makeLookupEntry(item, norm, fields) {
	return {
		value: item,
		original: item,
		label: String(norm[fields.label] ?? ''),
		get: (fieldName) => norm[fields[fieldName] ?? fieldName]
	}
}

/**
 * @param {SvelteMap} lookup  Accumulator map
 * @param {{ item: *, index: number, fields: *, path: Array<number> }} ctx
 */
// eslint-disable-next-line complexity
function visitLookupNode(lookup, ctx) {
	const { item, index, fields, path } = ctx
	const itemPath = [...path, index]
	const key = getKeyFromPath(itemPath)
	const norm = typeof item === 'object' && item !== null ? item : { [fields.label]: item }
	lookup.set(key, makeLookupEntry(item, norm, fields))
	const children = norm[fields.children] ?? []
	if (Array.isArray(children) && children.length > 0) {
		mergeChildLookup(lookup, deriveLookupWithProxy(children, getNestedFields(fields), itemPath))
	}
}

export function deriveLookupWithProxy(items, fields = DEFAULT_FIELDS, path = []) {
	const lookup = new SvelteMap()
	if (!items || !Array.isArray(items)) return lookup
	items.forEach((item, index) => visitLookupNode(lookup, { item, index, fields, path }))
	return lookup
}
