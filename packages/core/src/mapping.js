import { defaultFields } from './constants.js'
import { toString, isObject } from './utils.js'

/**
 * Get the component to be used to render the item.
 * If the component is null or undefined, it will return the default component.
 *
 * @param {object|string}                     value
 * @param {import('./types.js').FieldMapping} fields
 * @param {import('./types.js').ComponentMap} using
 */
export function getComponent(value, fields, using) {
	return fields.component && isObject(value)
		? (using[value[fields.component]] ?? using.default)
		: using.default
}

/**
 * Get the icon for the item. If the icon is an object, it will use the state to determine which icon to use.
 *
 * @param {object}                            value
 * @param {import('./types.js').FieldMapping} fields
 * @returns {string}
 */
function getIconFromObject(value, fields) {
	if (!value) return null
	if (typeof value[fields.icon] === 'object') return value[fields.icon][value[fields.state]]
	return value[fields.icon]
}

/**
 * Get the icon for the item. If the icon is an object, it will use the state to determine which icon to use.
 *
 * @param {object|string}                     value
 * @param {import('./types.js').FieldMapping} fields
 * @returns {string}
 */
export function getIcon(value, fields = defaultFields) {
	if (fields.icon === undefined || typeof value !== 'object') return null

	const name = getIconFromObject(value, fields)
	return fields.iconPrefix ? [fields.iconPrefix, name].join('-') : name
}

/**
 * Get the value for the item. If the value is an object,
 * it will use the field mapping to determine which attribute to get.
 *
 * @param {*}                              node
 * @param {import('./types').FieldMapping} fields
 * @returns {*}
 */
export function getValue(node, fields = defaultFields) {
	return typeof node === 'object' && node !== null
		? (node[fields.value] ?? node[fields.text])
		: node
}

/**
 * Get the text for the item. If the text is an object,
 * it will use the field mapping to determine which attribute to get.
 *
 * @param {*}                              node
 * @param {import('./types').FieldMapping} fields
 * @returns {string}
 */
export function getText(node, fields = defaultFields) {
	const value = isObject(node) ? node[fields.text] : node
	return value
}

/**
 * Gets the attribute from the node
 * @param {*}      node
 * @param {string} attr
 * @returns {*}
 */
export function getAttribute(node, attr) {
	return typeof node === 'object' && node !== null && attr !== null ? node[attr] : null
}

/**
 * Get the formatted text for the item. If the text is an object, use the field mapping to determine
 * which attribute to get currency. Use the formatter or identity function to format the text.
 *
 * @param {*}                              node
 * @param {import('./types').FieldMapping} fields
 * @param {Function}                       formatter
 * @returns {Function}
 */
export function getFormattedText(node, fields = defaultFields, formatter = toString) {
	const value = getText(node, fields)
	const currency = getAttribute(node, fields.currency)
	const formatValue = typeof formatter === 'function' ? formatter : toString

	return currency ? formatValue(value, currency) : formatValue(value)
}

/**
 * Check if the current item is a parent
 *
 * @param {*}                              item
 * @param {import('./types').FieldMapping} fields
 * @returns {boolean}
 */
export function hasChildren(item, fields) {
	return (
		item !== null &&
		typeof item === 'object' &&
		fields.children in item &&
		Array.isArray(item[fields.children])
	)
}

/**
 * Check if the current item is a parent and is expanded
 *
 * @param {*}                              item
 * @param {import('./types').FieldMapping} fields
 * @returns {boolean}
 */
export function isExpanded(item, fields) {
	if (item === null) return false
	if (!hasChildren(item, fields)) return false
	if (fields.isOpen in item) {
		return item[fields.isOpen]
	}
	return false
}

/**
 * Verify if at least one item has children
 *
 * @param {Array<*>}                       items
 * @param {import('./types').FieldMapping} fields
 * @returns {boolean}
 */
export function isNested(items, fields) {
	for (let i = 0; i < items.length; i++) {
		if (hasChildren(items[i], fields)) return true
	}
	return false
}
