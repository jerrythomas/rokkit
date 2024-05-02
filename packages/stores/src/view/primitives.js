import { equals, has } from 'ramda'
/**
 * Creates a list view data store using the given items.
 *
 * @param {Array}   items
 * @returns {Array} The list view data.
 */
export function getList(items) {
	return items.map((value, index) => ({ value, isSelected: false, indexPath: [index] }))
}

/**
 * Finds the index of the item with the given index path.
 *
 * @param {Array} data
 * @param {Number|Number[]} indexPath
 */
export function findIndex(data, indexPath) {
	if (!Array.isArray(indexPath)) {
		if (indexPath >= 0 && indexPath < data.length) return indexPath
		return -1
	}
	return data.findIndex((item) => equals(item.indexPath, indexPath))
}

/**
 * Finds the index of the item with the given value.
 *
 * @param {Array} data
 * @param {Any} value
 */
export function findIndexByValue(data, value) {
	return data.findIndex((item) => equals(item.value, value))
}
/**
 * Moves the current index by the given offset.
 *
 * @param {Object} state
 * @param {Number} offset
 * @returns {Object} The updated state.
 */
export function moveByOffset(state, offset) {
	const index = Math.max(0, Math.min(state.data.length - 1, state.currentIndex + offset))
	if (index !== state.currentIndex) state = moveTo(state, index)
	// return { ...state, currentIndex: index, value: state.data[index].value }
	return state
}

/**
 * Moves the current index to the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function moveTo(state, pathIndex) {
	const index = findIndex(state.data, pathIndex)

	if (index !== state.currentIndex && index > -1)
		return { ...state, currentIndex: index, rangeStart: index, value: state.data[index].value }
	return state
}

/**
 * Selects the item at the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function select(state, pathIndex) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index <= -1) return state

	if (!state.data[index].isSelected) {
		state.selectedItems.push(index)
	}
	state.data[index].isSelected = true
	return state
}

/**
 * Unselects the item at the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function unselect(state, pathIndex) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	if (state.data[index].isSelected) {
		state.selectedItems = state.selectedItems.filter((i) => i !== index)
	}
	state.data[index].isSelected = false
	return state
}

/**
 * Toggles the selection of the item at the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function toggleSelection(state, pathIndex) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	if (state.data[index].isSelected) {
		return unselect(state, index)
	}
	return select(state, index)
}

/**
 * Selects all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function selectAll(state) {
	state.data.forEach((_, index) => select(state, index))
	return state
}

/**
 * Unselects all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function unselectAll(state) {
	state.data.forEach((_, index) => unselect(state, index))
	return state
}

/**
 * Invert selection for all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function invertSelection(state) {
	state.data.forEach((_, index) => toggleSelection(state, index))
	return state
}

/**
 * Add items to selection based on range
 *
 * @param {Object} state
 * @param (integer) offset
 * @returns {Object} The updated state.
 */
export function selectRange(state, offset) {
	if (!has('rangeStart', state)) return state
	const rangeEnd = state.rangeStart + offset

	if (rangeEnd !== state.rangeEnd) {
		state = unselectAll(state)
		state.rangeEnd = rangeEnd

		const min = Math.min(state.rangeStart, state.rangeEnd)
		const max = Math.max(state.rangeStart, state.rangeEnd)

		const range = Array.from({ length: max - min + 1 }).map((_, i) => i + min)

		range.forEach((index) => {
			state = select(state, index)
		})
	}

	return state
}

/**
 * Expands the item at the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function expand(state, pathIndex) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	const item = state.data[index]
	if (!item.isParent || item.isExpanded) return state

	item.isExpanded = true
	updateChildVisibility(item.children, item.isExpanded)

	return state
}

/**
 * Collapses the item at the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function collapse(state, pathIndex) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	const item = state.data[index]
	if (!item.isParent || !item.isExpanded) return state

	item.isExpanded = false
	updateChildVisibility(item.children, item.isExpanded)

	return state
}

/**
 * Toggles the expansion of the item at the given index.
 *
 * @param {Object}          state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function toggleExpansion(state, pathIndex) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state
	if (state.data[index].isExpanded) {
		return collapse(state, index)
	}
	return expand(state, index)
}

/**
 * Expands all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function expandAll(state) {
	state.data.forEach((_, index) => expand(state, index))
	return state
}

/**
 * Collapses all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function collapseAll(state) {
	state.data.forEach((_, index) => collapse(state, index))
	return state
}

/**
 * Recursively update visibility for all children of the given parent
 * based on the parent's expanded state. Stops recursion if a child's expanded
 * state does not match the parent's state.
 *
 * @param {Array} children - The children of the parent to update visibility for.
 * @param {Boolean} isVisible - Indicates whether children should be visible or hidden.
 */
function updateChildVisibility(children, isVisible) {
	children.forEach((child) => {
		// Update visibility only if child's expanded state mismatches with the desired visibility
		if (child.isExpanded === isVisible) {
			child.isHidden = !isVisible // Update based on parent's state
			if (child.children) {
				updateChildVisibility(child.children, isVisible) // Recursive call for further children
			}
		}
	})
}
