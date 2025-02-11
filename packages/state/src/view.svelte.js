import { equals } from 'ramda'
import { FieldMapper } from '@rokkit/core'
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

export class View {
	items = []
	data = $state([])
	fields = $state(new FieldMapper())
	value = $state(null)
	currentIndex = $state(-1)
	selectedItems = $state([])

	#eventHandlers = new Map()

	constructor(items, options = {}) {
		const { fields, nested = false } = options
		this.items = items
		this.data = nested ? getTree(items) : getList(items)
		this.fields = fields
		this.currentIndex = validatedIndex(this.data, options.currentIndex ?? 0)
		this.value = getValue(this.data, this.currentIndex)
	}

	on(events) {
		// Accept object with event names as keys and callbacks as values
		for (const [event, callback] of Object.entries(events)) {
			this.#eventHandlers.set(event, callback)
		}
	}

	#emit(eventName, data) {
		const handler = this.#eventHandlers.get(eventName)
		if (handler) handler(data)
	}

	moveByOffset(offset = 1) {
		const newIndex = Math.min(Math.max(0, this.currentIndex + offset), this.data.length - 1)

		// Only update if position actually changes
		if (newIndex !== this.currentIndex) {
			this.currentIndex = newIndex
			this.value = this.data[newIndex].value
			this.#emit('move', { index: newIndex, value: this.value })
		}
	}

	select(indexPath) {
		const index = this.#findIndex(indexPath)

		if (index !== -1 && !this.data[index].isSelected) {
			this.data[index].isSelected = true
			this.selectedItems.push(index)
			this.#emit(
				'select',
				this.selectedItems.map((i) => this.data[i].value)
			)
		}
	}

	unselect(indexPath) {
		const index = this.#findIndex(indexPath)
		if (this.data[index].isSelected) {
			//in place remove item from selectedItems
			const pos = this.selectedItems.indexOf(index)
			this.selectedItems.splice(pos, 1)
			this.data[index].isSelected = false
			this.#emit(
				'select',
				this.selectedItems.map((i) => this.data[i].value)
			)
		}
	}

	toggleSelection(indexPath) {
		const path = Array.isArray(indexPath) ? indexPath : [indexPath]

		if (!this.#isValidPath(path)) {
			return
		}

		const item = this.#getItemAtPath(path)
		if (item.isSelected) {
			this.unselect(path)
		} else {
			this.select(path)
		}
	}

	// Helper methods
	#isValidPath(path) {
		let current = this.data
		for (const index of path) {
			if (!current[index]) return false
			current = current[index].children || []
		}
		return true
	}

	#getItemAtPath(path) {
		let current = this.data
		for (let i = 0; i < path.length - 1; i++) {
			current = current[path[i]].children
		}
		return current[path[path.length - 1]]
	}

	/**
	 * Finds the index of the item with the given index path.
	 *
	 * @param {Array} data
	 * @param {Number|Number[]} indexPath
	 */
	#findIndex(indexPath) {
		if (!Array.isArray(indexPath)) {
			if (indexPath >= 0 && indexPath < this.data.length) return indexPath
			return -1
		}
		return this.data.findIndex((item) => equals(item.indexPath, indexPath))
	}

	#pathsEqual(path1, path2) {
		return path1.length === path2.length && path1.every((value, index) => value === path2[index])
	}
}
