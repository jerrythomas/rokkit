import { SvelteMap } from 'svelte/reactivity'
import { FieldMapper } from '@rokkit/core'
import { isNil, equals } from 'ramda'
import { getKeyFromPath } from '@rokkit/core'

export class ListController {
	items = $state(null)
	selected = new SvelteMap()
	activeItem = $state(null)
	activeIndex = -1
	options = $state({})

	mappers = $state([])
	data = $state(null)
	lookup = new SvelteMap()

	constructor(items, value, fields, options) {
		this.items = items
		this.mappers.push(new FieldMapper(fields))
		this.options = { multiSelect: false, ...options }
		this.init(items, value)
	}

	get isNested() {
		return this.mappers.length > 0
	}

	/**
	 * @protected
	 */
	init(items, value) {
		console.log('init', value)
		this.data = items
		this.data.forEach((item, index) => {
			this.lookup.set(getKeyFromPath(index), item)
		})
		this.moveToValue(value)
	}

	/**
	 * @private
	 * @param {number|number[]} path
	 */
	getIndexFromPath(path) {
		return !isNil(path) && !Array.isArray(path) ? path : path[0]
	}

	moveToValue(value) {
		if (!value) return false

		const index = this.data.findIndex((item) => equals(item, value))
		return this.select(index)
	}
	/**
	 * @private
	 * @param {numeric} index
	 */
	setActiveItem(index) {
		this.activeItem = this.data[index]
	}
	/**
	 * @private
	 * @param {numeric} index
	 */
	getItemAtIndex(index) {
		return this.data[index]
	}

	moveTo(path) {
		const index = this.getIndexFromPath(path)
		console.log('moveTo', path, index)
		if (index >= 0 && index < this.data.length && index !== this.activeIndex) {
			this.activeIndex = index
			this.setActiveItem(index)
			return true
		}
		return false
	}

	movePrev() {
		if (this.activeIndex < 0) {
			return this.moveTo(0)
		} else if (this.activeIndex > 0) {
			return this.moveTo(this.activeIndex - 1)
		}
		return false
	}

	moveNext() {
		if (this.activeIndex < this.data.length - 1) {
			return this.moveTo(this.activeIndex + 1)
		}
		return false
	}

	moveFirst() {
		this.moveTo(0)
	}

	moveLast() {
		this.moveTo(this.data.length - 1)
	}

	/**
	 * @private
	 * @param {number} index
	 */
	toggleSelection(path) {
		const key = getKeyFromPath(path)
		const index = this.getIndexFromPath(path)

		if (this.selected.has(key)) {
			this.selected.delete(key)
		} else {
			this.selected.add(key, this.getItemAtIndex(index))
		}
		return true
	}

	/**
	 *
	 * @param {number|number[]} path
	 * @returns
	 */
	extendSelection(path) {
		const index = isNil(path) ? this.activeIndex : this.getIndexFromPath(path)
		if (index >= 0 && index < this.data.length) return false

		if (this.options.multiselect) {
			return this.toggleSelection(path)
		} else {
			return this.select(path)
		}
	}

	/**
	 *
	 * @param {number|number[]} path
	 * @returns
	 */
	select(path) {
		const index = isNil(path) ? this.activeIndex : this.getIndexFromPath(path)
		if (index > -1 && index !== this.activeIndex) {
			this.selected.clear()
			this.selected.set(getKeyFromPath(path), this.getItemAtIndex(index))
		}

		this.moveTo(path)
		return true
	}

	toggleExpansion() {
		return false
	}
}
