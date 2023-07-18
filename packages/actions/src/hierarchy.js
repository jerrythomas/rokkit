/**
 * A part of the path to node in hierarchy
 *
 * @typedef PathFragment
 * @property {integer}                             index  - Index to item in array
 * @property {Array<*>}                            items  - Array of items
 * @property {import('../constants').FieldMapping} fields - Field mapping for the data
 */

/**
 * Check if the current item is a parent
 *
 * @param {*} item
 * @param {import('../constants').FieldMapping} fields
 * @returns {boolean}
 */
export function hasChildren(item, fields) {
	return (
		typeof item === 'object' &&
		fields.children in item &&
		Array.isArray(item[fields.children])
	)
}

/**
 * Check if the current item is a parent and is expanded
 *
 * @param {*} item
 * @param {import('../constants').FieldMapping} fields
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
 * @param {import('../constants').FieldMapping} fields
 * @returns {boolean}
 */
export function isNested(items, fields) {
	for (let i = 0; i < items.length; i++) {
		if (hasChildren(items[i], fields)) return true
	}
	return false
}

/**
 * Navigate to last visible child in the hirarchy starting with the provided path
 *
 * @param {Array<PathFragment>} path - path to a node in the hierarchy
 * @returns
 */
export function navigateToLastVisibleChild(path) {
	let current = path[path.length - 1]

	while (isExpanded(current.items[current.index], current.fields)) {
		const items = current.items[current.index][current.fields.children]
		const level = {
			items,
			index: items.length - 1,
			fields: current.fields.fields ?? current.fields
		}
		path.push(level)
		current = level
	}

	return path
}

/**
 * Navigate to the next item
 *
 * @param {Array<PathFragment>}                 path  - path to a node in the hierarchy
 * @param {Array<*>}                            items - array of items
 * @param {import('../constants').FieldMapping} fields - field mapping
 * @returns
 */
export function moveNext(path, items, fields) {
	if (path.length === 0) {
		return [{ index: 0, items, fields }]
	}

	const current = path[path.length - 1]
	if (isExpanded(current.items[current.index], current.fields)) {
		path.push({
			items: current.items[current.index][current.fields.children],
			index: 0,
			fields: current.fields.fields || current.fields
		})
	} else if (current.index < current.items.length - 1) {
		current.index++
	} else {
		let level = path.length - 2
		while (level >= 0) {
			const parent = path[level]
			if (parent.index < parent.items.length - 1) {
				parent.index++
				path = path.slice(0, level + 1)
				break
			}
			level--
		}
	}
	return path
}

/**
 * Navigate to the previous item
 *
 * @param {Array<PathFragment>} path  - path to a node in the hierarchy
 * @returns
 */
export function movePrevious(path) {
	if (path.length === 0) return []

	const current = path[path.length - 1]

	if (current.index == 0) {
		if (path.length > 1) path.pop()
		return path
	}

	current.index--
	if (isExpanded(current.items[current.index], current.fields)) {
		return navigateToLastVisibleChild(path)
	}
	return path
}

/**
 *
 * @param {Array<integer>} indices
 * @param {Array<*>} items
 * @param {import('../constants').FieldMapping} fields
 * @returns
 */
export function pathFromIndices(indices, items, fields) {
	let path = []
	let fragment
	indices.map((index, level) => {
		if (level === 0) {
			fragment = { index, items, fields }
		} else {
			fragment = {
				index,
				items: fragment.items[fragment.index][fragment.fields.children],
				fields: fragment.fields.fields ?? fragment.fields
			}
		}
		path.push(fragment)
	})
	return path
}

export function indicesFromPath(path) {
	return path.map(({ index }) => index)
}
export function getCurrentNode(path) {
	if (path.length === 0) return null
	const lastIndex = path.length - 1
	return path[lastIndex].items[path[lastIndex].index]
}

export function findItem(items, indices, fields) {
	let item = items[indices[0]]
	let levelFields = fields
	for (let level = 1; level < indices.length; level++) {
		item = item[levelFields.children][indices[level]]
		levelFields = levelFields.fields ?? levelFields
	}
	return item
}
