import { writable, get } from 'svelte/store'
import { omit } from 'ramda'
import { getTree } from './view/tree'
import {
	getList,
	collapse,
	collapseAll,
	expand,
	expandAll,
	moveByOffset,
	moveTo,
	select,
	selectAll,
	selectRange,
	toggleExpansion,
	toggleSelection,
	unselect,
	unselectAll,
	invertSelection
} from './view/primitives'

/**
 * Creates a view store with extended functionalities.
 *
 * @param {Array} items
 * @param {Object} options
 * @returns {Object} An extended writable store.
 */
// eslint-disable-next-line max-lines-per-function
export function createView(items, options = {}) {
	const { fields, nested = false } = options
	const data = nested ? getTree(items) : getList(items)
	const events = writable([])
	const currentIndex = validatedIndex(data, options.currentIndex ?? 0)

	const view = writable({
		data,
		fields,
		value: getValue(data, currentIndex),
		currentIndex,
		selectedItems: []
	})
	const { subscribe } = view

	const updateView = (updateCallback) => {
		const state = updateCallback({ ...get(view), events: [] })
		events.update((value) => [...value, ...(state.events ?? [])])
		view.set(omit(['events'], state))
	}

	return {
		subscribe,
		// getEvents: () => getAllEvents(view),
		currentItem: () => getCurrentItem(view),
		moveByOffset: (offset = 1) => updateView((state) => moveByOffset(state, offset)),
		moveFirst: () => updateView((state) => moveByOffset(state, -Infinity)),
		moveLast: () => updateView((state) => moveByOffset(state, Infinity)),
		moveTo: (index) => updateView((state) => moveTo(state, index)),
		select: (index) => updateView((state) => select(state, index)),
		unselect: (index) => updateView((state) => unselect(state, index)),
		toggleSelection: (index) => updateView((state) => toggleSelection(state, index)),
		selectAll: () => updateView((state) => selectAll(state)),
		unselectAll: () => updateView((state) => unselectAll(state)),
		selectNone: () => updateView((state) => unselectAll(state)),
		selectRange: (offset) => updateView((state) => selectRange(state, offset)),
		invertSelection: () => updateView((state) => invertSelection(state)),
		expand: (index) => updateView((state) => expand(state, index)),
		collapse: (index) => updateView((state) => collapse(state, index)),
		toggleExpansion: (index) => updateView((state) => toggleExpansion(state, index)),
		expandAll: () => updateView((state) => expandAll(state)),
		collapseAll: () => updateView((state) => collapseAll(state)),
		events
	}
}

/**
 * Gets the current item from the view store.
 *
 * @param {import('svelte/store').Writable} view - the view store.
 * @returns {Object}                               The current item.
 */
function getCurrentItem(view) {
	const state = get(view)
	const currentItem =
		state.data.length > 0 && state.currentIndex >= 0 ? state.data[state.currentIndex] : null
	return currentItem
}

/**
 * Validates the index.
 *
 * @param {Array} data
 * @param {Number} index
 * @returns {Number} The validated index.
 */
function validatedIndex(data, index) {
	return index < 0 || index >= data.length ? -1 : index
}

/**
 * Gets the value of the item at the specified index.
 *
 * @param {Array} data
 * @param {Number} index
 * @returns {Object} The value of the item.
 */
function getValue(data, index) {
	if (index >= 0) return data[index].value
	return null
}
