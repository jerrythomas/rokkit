import { defaultFields } from './constants'
import { isExpanded, hasChildren, getAttribute } from './mapping'
import { equals } from 'ramda'

function isMatch(item, attr, value) {
	const itemValue = attr ? getAttribute(item, attr) : item
	return equals(itemValue, value)
}

function findInChildren(item, index, fields, value, attr, position) {
	if (hasChildren(item, fields)) {
		return findItemByValue(value, item[fields.children], fields.fields ?? fields, attr, [
			...position,
			index
		])
	}
}
/**
 * Traverses the tree to find an item by value.
 * @param {Array} items - The items array.
 * @param {Object} fields - The fields mapping.
 * @param {any} value - The value to find.
 * @param {Array} position - The current position in the tree.
 * @returns {Object} The found item, or null if not found.
 */
export function findItemByValue(value, items, fields = defaultFields, attr = null, position = []) {
	for (let i = 0; i < items.length; i++) {
		if (isMatch(items[i], attr, value)) {
			return { item: items[i], position: [...position, i], fields }
		}

		const foundInChildren = findInChildren(items[i], i, fields, value, attr, position)
		if (foundInChildren) return foundInChildren
	}

	return null
}

/**
 * Gets an item from an items array using an index array.
 * @param {Array} indices - The index array.
 * @param {Array} items - The items array.
 * @param {Object} fields - The fields configuration.
 * @returns {Object} The item.
 */
export function findItemByIndexArray(indices, items, fields) {
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

/**
 *
 * @param {Array<integer>} position
 * @param {Array<*>} items
 * @param {import('./types').FieldMapping} fields
 * @returns
 */
export function findNearestItemBefore(position, items, fields) {
	if (items.length === 0) return null
	if (position.length === 0) return { item: items[0], position: [0], fields }

	let index = position[position.length - 1]
	let result = null
	if (index > 0) {
		index -= 1
		if (position.length === 1) {
			return findLastVisibleChild(items[index], [index], fields)
		}

		const sibling = findItemByIndexArray([...position.slice(0, -1), index], items, fields)
		result = findLastVisibleChild(sibling.item, sibling.position, sibling.fields)
	} else {
		result = findItemByIndexArray(position.slice(0, -1), items, fields)
	}
	return result
}

/**
 *
 * @param {*} parent
 * @param {Array<integer>} position
 * @param {import('./types').FieldMapping} fields
 * @returns
 */
export function findLastVisibleChild(parent, position, fields) {
	if (isExpanded(parent, fields)) {
		const children = parent[fields.children]
		return findLastVisibleChild(
			children[children.length - 1],
			position.concat(children.length - 1),
			fields.fields ?? fields
		)
	}
	return { item: parent, position, fields }
}

/**
 * Returns the next item in the tree.
 * @param {Array} position - The position of the current item.
 * @param {Array} items - The items in the tree.
 * @param {Object} fields - The fields mapping.
 * @returns {Object|null} The next item or null if there is none.
 */
export function findNearestItemAfter(position, items, fields) {
	if (items.length === 0) return null
	if (position.length === 0) return { item: items[0], position: [0], fields }

	const current = findItemByIndexArray(position, items, fields)
	let result = null
	if (isExpanded(current.item, current.fields)) {
		result = getFirstChild(current, position)
	} else if (position.length === 1) {
		result = getNextSiblingAtRoot(position, items, fields)
	} else {
		result = getNextSiblingOrAncestor(position, items, fields)
	}
	return result
}

/**
 * Returns the next child of the current item.
 * @param {Object} current - The current item.
 * @param {Array} position - The position of the current item.
 * @returns {Object} The next child.
 */
function getFirstChild(current, position) {
	return {
		item: current.item[current.fields.children][0],
		position: position.concat(0),
		fields: current.fields.fields ?? current.fields
	}
}

/**
 * Returns the next sibling of the current item at the root level.
 * @param {Array} position - The position of the current item.
 * @param {Array} items - The items in the tree.
 * @param {Object} fields - The fields mapping.
 * @returns {Object|null} The next sibling or null if there is none.
 */
function getNextSiblingAtRoot(position, items, fields) {
	if (position[0] < items.length - 1) {
		return {
			item: items[position[0] + 1],
			position: [position[0] + 1],
			fields
		}
	}
	return null
}

/**
 * Returns the next sibling of the current item or the next item in the ancestor.
 * @param {Array} position - The position of the current item.
 * @param {Array} items - The items in the tree.
 * @param {Object} fields - The fields mapping.
 * @returns {Object|null} The next sibling or ancestor or null if there is none.
 */
function getNextSiblingOrAncestor(position, items, fields) {
	let index = position[position.length - 1]
	let parent = findItemByIndexArray(position.slice(0, -1), items, fields)
	let children = parent.item[parent.fields.children]
	if (index < children.length - 1) {
		index += 1

		const sibling = findItemByIndexArray([...position.slice(0, -1), index], items, fields)
		return { item: sibling.item, position: sibling.position, fields }
	} else {
		while (index === children.length - 1) {
			index = position[position.length - 1]
			position = position.slice(0, -1)
			if (position.length === 0) return null
			parent = findItemByIndexArray(position, items, fields)
			children = parent.item[parent.fields.children]
		}
		if (index < children.length - 1) {
			return {
				item: children[index + 1],
				position: [...position, index + 1],
				fields
			}
		}
	}
}

/**
 * Creates a mapped list from an items array and a fields mapping.
 * @param {Array<Object>} items - The items array.
 * @param {import('./types').FieldMapping} fields - The fields mapping.
 * @returns {Object} The mapped list.
 */
export function mappedList(items, fields) {
	const findByValue = (value) => findItemByValue(value, items, fields)
	const findByAttribute = (value, attr) => findItemByValue(value, items, fields, attr)
	const findByIndexArray = (index) => findItemByIndexArray(index, items, fields)
	const previous = (position) => findNearestItemBefore(position, items, fields)
	const next = (position) => findNearestItemAfter(position, items, fields)

	const update = (newItems, newFields) => {
		items = newItems
		fields = newFields
	}
	return {
		findByValue,
		findByAttribute,
		findByIndexArray,
		previous,
		next,
		update
	}
}
