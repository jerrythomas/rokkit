import { equals, has } from 'ramda'

/**
 * Add an event to the event stack
 * @param {Object} state
 * @param {Object} event
 * @param {Number} index
 * @returns {Object} The updated state.
 */
export function addEvent(state, event, index = -1) {
	// state.events = state.events ?? []

	if (event === 'select') {
		const detail = state.selectedItems.map((i) => state.data[i].value)
		state.events.push({ type: event, detail })
	} else if (event === 'move' || index > -1) {
		const { value = null, indexPath = null } = index >= 0 ? state.data[index] : {}
		state.events.push({ type: event, detail: { value, path: indexPath } })
	}
}

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
 * Moves the current index to the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function moveTo(state, pathIndex) {
	const index = findIndex(state.data, pathIndex)

	if (index !== state.currentIndex && index > -1) {
		state = { ...state, currentIndex: index, rangeStart: index, value: state.data[index].value }
		addEvent(state, 'move', index)
	}

	return state
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

	return state
}

/**
 * Selects the item at the given index.
 *
 * @param {Object}          state     - The current state.
 * @param {Number|Number[]} pathIndex - The index of the item to select.
 * @param {Boolean}         events    - Whether to add an event.
 * @returns {Object} The updated state.
 */
export function select(state, pathIndex, events = true) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index <= -1) return state

	if (!state.data[index].isSelected) {
		state.selectedItems.push(index)
	}
	state.data[index].isSelected = true
	if (events) addEvent(state, 'select')
	return state
}

/**
 * Unselects the item at the given index.
 *
 * @param {Object}          state     - The current state.
 * @param {Number|Number[]} pathIndex - The index of the item to select.
 * @param {Boolean}         events    - Whether to add an event.

 * @returns {Object} The updated state.
 */
export function unselect(state, pathIndex, events = true) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	if (state.data[index].isSelected) {
		state.selectedItems = state.selectedItems.filter((i) => i !== index)
	}
	state.data[index].isSelected = false
	if (events) addEvent(state, 'select')
	return state
}

/**
 * Toggles the selection of the item at the given index.
 *
 * @param {Object}          state
 * @param {Number|Number[]} pathIndex
 * @param {Boolean}         events
 * @returns {Object} The updated state.
 */
export function toggleSelection(state, pathIndex, events = true) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	if (state.data[index].isSelected) {
		return unselect(state, index, events)
	}
	return select(state, index, events)
}

/**
 * Selects all items.
 *
 * @param {Object} state
 * @param {Boolean} emit - Whether to emit an event.
 * @returns {Object} The updated state.
 */
export function selectAll(state, emit = true) {
	state.data.forEach((_, index) => select(state, index, false))
	if (emit) addEvent(state, 'select')
	return state
}

/**
 * Unselects all items.
 *
 * @param {Object} state
 * @param {Boolean} emit - Whether to emit an event.
 * @returns {Object} The updated state.
 */
export function unselectAll(state, emit = true) {
	state.data.forEach((_, index) => unselect(state, index, false))
	if (emit) addEvent(state, 'select')
	return state
}

/**
 * Invert selection for all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function invertSelection(state) {
	state.data.forEach((_, index) => toggleSelection(state, index, false))
	addEvent(state, 'select')
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
		state = unselectAll(state, false)
		state.rangeEnd = rangeEnd

		const min = Math.min(state.rangeStart, state.rangeEnd)
		const max = Math.max(state.rangeStart, state.rangeEnd)

		const range = Array.from({ length: max - min + 1 }).map((_, i) => i + min)

		range.forEach((index) => {
			state = select(state, index, false)
		})
		addEvent(state, 'select')
	}

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

/**
 * Toggles the expansion of the item at the given index.
 *
 * @param {Object} state
 * @param {Number} index
 * @param {Boolean} expand - the state
 * @param {Boolean} events - Whether to emit event
 * @returns {Object} The updated state.
 */
function toggle(state, index, events = true) {
	const item = state.data[index]
	item.isExpanded = !item.isExpanded

	updateChildVisibility(item.children, item.isExpanded)
	if (events) {
		const event = item.isExpanded ? 'expand' : 'collapse'
		addEvent(state, event, index)
	}
	return state
}

/**
 * Expands the item at the given index.
 *
 * @param {Object}          state      - The current state
 * @param {Number|Number[]} pathIndex  - Index of item to expand
 * @param {Boolean}         emit       - Whether to add event
 * @returns {Object} The updated state.
 */
export function expand(state, pathIndex, emit = true) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	const item = state.data[index]

	if (item.isParent && !item.isExpanded) {
		state = toggle(state, index, emit)
	}

	return state
}

/**
 * Collapses the item at the given index.
 *
 * @param {Object} state
 * @param {Number|Number[]} pathIndex
 * @returns {Object} The updated state.
 */
export function collapse(state, pathIndex, emit = true) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state

	const item = state.data[index]
	if (item.isParent && item.isExpanded) {
		state = toggle(state, index, emit)
	}

	return state
}
/**
 * Toggles the expansion of the item at the given index.
 *
 * @param {Object}          state
 * @param {Number|Number[]} pathIndex
 * @param {Boolean}         emit
 * @returns {Object} The updated state.
 */
export function toggleExpansion(state, pathIndex, emit = true) {
	const index = findIndex(state.data, pathIndex ?? state.currentIndex)
	if (index === -1) return state
	if (state.data[index].isParent) return toggle(state, index, emit)
	return state
	// if (state.data[index].isExpanded) {
	// 	return collapse(state, index, emit)
	// }
	// return expand(state, index)
}

/**
 * Expands all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function expandAll(state) {
	state.data.forEach((_, index) => expand(state, index, false))
	addEvent(state, 'expand')
	return state
}

/**
 * Collapses all items.
 *
 * @param {Object} state
 * @returns {Object} The updated state.
 */
export function collapseAll(state) {
	state.data.forEach((_, index) => collapse(state, index, false))
	addEvent(state, 'collapse')
	return state
}
