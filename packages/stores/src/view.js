import { writable } from 'svelte/store'
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
	toggleExpansion,
	toggleSelection,
	unselect,
	unselectAll
} from './view/primitives'
/**
 * Creates a view store with extended functionalities.
 *
 * @param {Array} items
 * @param {Object} options
 * @returns {Object} An extended writable store.
 */
export function createView(items, options = {}) {
	const { fields, currentIndex = 0 } = options
	const data = getList(items)

	const { subscribe, update } = writable({
		data,
		fields,
		value: data[currentIndex].value,
		currentIndex,
		selectedItems: []
	})

	return {
		subscribe,
		moveByOffset: (offset = 1) => update((state) => moveByOffset(state, offset)),
		moveFirst: () => update((state) => moveByOffset(state, -Infinity)),
		moveLast: () => update((state) => moveByOffset(state, Infinity)),
		moveTo: (index) => update((state) => moveTo(state, index)),
		select: (index) => update((state) => select(state, index)),
		unselect: (index) => update((state) => unselect(state, index)),
		toggleSelection: (index) => update((state) => toggleSelection(state, index)),
		selectAll: () => update((state) => selectAll(state)),
		unselectAll: () => update((state) => unselectAll(state)),
		expand: (index) => update((state) => expand(state, index)),
		collapse: (index) => update((state) => collapse(state, index)),
		toggleExpansion: (index) => update((state) => toggleExpansion(state, index)),
		expandAll: () => update((state) => expandAll(state)),
		collapseAll: () => update((state) => collapseAll(state))
	}
}
