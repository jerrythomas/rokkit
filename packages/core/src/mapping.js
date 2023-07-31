import { defaultFields } from './constants'

/**
 * Get the component to be used to render the item.
 * If the component is null or undefined, it will return the default component.
 *
 * @param {object|string} value
 * @param {import('./types.js').FieldMapping} fields
 * @param {import('./types.js').ComponentMap} using
 */
export function getComponent(value, fields, using) {
	return fields.component && typeof value == 'object'
		? using[value[fields.component]] ?? using.default
		: using.default
}

/**
 * Get the icon for the item. If the icon is an object, it will use the state to determine which icon to use.
 *
 * @param {object|string} value
 * @param {import('./types.js').FieldMapping} fields
 */
export function getIcon(value, fields = defaultFields) {
	if (fields.icon === undefined || typeof (value ?? '') !== 'object')
		return null

	return typeof value[fields.icon] == 'object'
		? value[fields.icon][value[fields.state]]
		: value[fields.icon]
}

export function getValue(node, fields = defaultFields) {
	return typeof node === 'object' && node !== null
		? node[fields.value] ?? node[fields.text]
		: node
}

export function getText(node, fields = defaultFields) {
	return typeof node === 'object' && node !== null ? node[fields.text] : node
}

export function getAttribute(node, attr) {
	return typeof node === 'object' && node !== null ? node[attr] : null
}
/**
 * Check if the current item is a parent
 *
 * @param {*} item
 * @param {import('./types').FieldMapping} fields
 * @returns {boolean}
 */
export function hasChildren(item, fields) {
	return (
		item != null &&
		typeof item === 'object' &&
		fields.children in item &&
		Array.isArray(item[fields.children])
	)
}

/**
 * Check if the current item is a parent and is expanded
 *
 * @param {*} item
 * @param {import('./types').FieldMapping} fields
 * @returns {boolean}
 */
export function isExpanded(item, fields) {
	if (item == null) return false
	if (!hasChildren(item, fields)) return false
	if (fields.isOpen in item) {
		return item[fields.isOpen]
	}
	return false
}

/**
 * Verify if at least one item has children
 *
 * @param {Array<*>} items
 * @param {import('./types').FieldMapping} fields
 * @returns {boolean}
 */
export function isNested(items, fields) {
	for (let i = 0; i < items.length; i++) {
		if (hasChildren(items[i], fields)) return true
	}
	return false
}
