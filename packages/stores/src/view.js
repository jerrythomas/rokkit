import { writable, get } from 'svelte/store'
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

	let currentIndex = validatedIndex(data, options.currentIndex ?? 0)

	const view = writable({
		data,
		fields,
		events: [],
		value: getValue(data, currentIndex),
		currentIndex,
		selectedItems: []
	})
	const { subscribe, update } = view

	return {
		subscribe,
		getEvents: () => getAllEvents(view),
		currentItem: () => getCurrentItem(view),
		moveByOffset: (offset = 1) => update((state) => moveByOffset(state, offset)),
		moveFirst: () => update((state) => moveByOffset(state, -Infinity)),
		moveLast: () => update((state) => moveByOffset(state, Infinity)),
		moveTo: (index) => update((state) => moveTo(state, index)),
		select: (index) => update((state) => select(state, index)),
		unselect: (index) => update((state) => unselect(state, index)),
		toggleSelection: (index) => update((state) => toggleSelection(state, index)),
		selectAll: () => update((state) => selectAll(state)),
		unselectAll: () => update((state) => unselectAll(state)),
		selectNone: () => update((state) => unselectAll(state)),
		selectRange: (offset) => update((state) => selectRange(state, offset)),
		invertSelection: () => update((state) => invertSelection(state)),
		expand: (index) => update((state) => expand(state, index)),
		collapse: (index) => update((state) => collapse(state, index)),
		toggleExpansion: (index) => update((state) => toggleExpansion(state, index)),
		expandAll: () => update((state) => expandAll(state)),
		collapseAll: () => update((state) => collapseAll(state))
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
 * Get all events and clears the events array.
 *
 * @param {Object} store
 * @returns {Object} The updated state.
 */
function getAllEvents(store) {
	const events = get(store).events
	store.update((state) => ({ ...state, events: [] }))
	return events
}

function validatedIndex(data, index) {
	return index < 0 || index >= data.length ? -1 : index
}

function getValue(data, index) {
	if (index >= 0) return data[index].value
	return null
}
