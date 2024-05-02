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
	const { fields, currentIndex = 0, nested = false } = options
	const data = nested ? getTree(items) : getList(items)

	const view = writable({
		data,
		fields,
		value: data[currentIndex].value,
		currentIndex,
		selectedItems: []
	})
	const { subscribe, update } = view

	return {
		subscribe,
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
