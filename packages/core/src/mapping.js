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

/**
 * Traverses the tree to find an item by value.
 * @param {Array} items - The items array.
 * @param {Object} fields - The fields mapping.
 * @param {any} value - The value to find.
 * @param {Array} position - The current position in the tree.
 * @returns {Object} The found item, or null if not found.
 */
export function findItemByValue(items, fields, value, position = []) {
	for (let i = 0; i < items.length; i++) {
		const item = items[i]

		// Check if the item's value matches the target value.
		if (item.value === value) {
			// Return the item and its position.
			return { item, position: position.concat(i), fields }
		}

		// If the item has children, recurse into them.
		if (hasChildren(item, fields)) {
			const found = findItemByValue(
				item[fields.children],
				fields.fields ?? fields,
				value,
				position.concat(i)
			)
			// If the item was found in the children, return it.
			if (found) return found
		}
	}

	// If the item was not found, return null.
	return null
}

/**
 * Gets an item from an items array using an index array.
 * @param {Array} indices - The index array.
 * @param {Array} items - The items array.
 * @param {Object} fields - The fields configuration.
 * @returns {Object} The item.
 */
export function getItemByIndexArray(indices, items, fields) {
	let item = items[indices[0]]
	let levelFields = fields
	for (let level = 1; level < indices.length; level++) {
		if (hasChildren(item, levelFields)) {
			item = item[levelFields.children][indices[level]]
			levelFields = levelFields.fields ?? levelFields
		} else {
			return null
		}
	}
	return { item, position: indices, fields: levelFields }
}
