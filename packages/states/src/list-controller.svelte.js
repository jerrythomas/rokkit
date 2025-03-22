import { FieldMapper } from '@rokkit/core'
import { isNil } from 'ramda'

export class ListController {
	items = $state(null)
	selected = $state([])
	activeItem = $state(null)
	mapper = new FieldMapper()
	activeIndex = $state(-1)
	options = $state({})

	constructor(items, value, fields, options) {
		this.items = items
		this.mapper = new FieldMapper(fields)
		this.options = { multiSelect: false, ...options }
		this.moveToValue(value)
	}

	get isNested() {
		return false
	}

	/**
	 * @private
	 * @param {number|number[]} path
	 */
	getIndexFromPath(path) {
		return isNil(path) && !Array.isArray(path) ? path : path[0]
	}

	moveToValue(value) {
		this.activeItem = value
		if (isNil(value)) {
			this.activeIndex = -1
			this.selected = []
		} else {
			this.activeIndex = this.items.indexOf(value)
			this.selected = [value]
			console.log(this.activeIndex)
		}
	}

	moveTo(path) {
		const index = this.getIndexFromPath(path)

		if (index >= 0 && index < this.items.length) {
			this.activeIndex = index
			this.activeItem = this.items[index]
			return true
		}
		return false
	}

	movePrev() {
		// if (this.activeIndex < 0) {
		//   this.activeIndex = 0
		// }
		if (this.activeIndex > 0) {
			this.activeIndex--
			this.activeItem = this.items[this.activeIndex]
			return true
		}
		return false
	}

	moveNext() {
		if (this.activeIndex < this.items.length - 1) {
			this.activeIndex++
			this.activeItem = this.items[this.activeIndex]
			return true
		}
		return false
	}

	moveFirst() {
		this.moveTo(0)
	}

	moveLast() {
		this.moveTo(this.items.length - 1)
	}

	/**
	 * @private
	 * @param {number} index
	 */
	toggleSelection(index) {
		if (this.selected.includes(this.items[index])) {
			this.selected = this.selected.filter((item) => item !== this.items[index])
		} else {
			this.selected.push(this.items[index])
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
		if (index >= 0 && index < this.items.length) return false

		if (this.options.multiselect) {
			return this.toggleSelection(index)
		} else {
			return this.select(index)
		}
	}

	/**
	 *
	 * @param {number|number[]} path
	 * @returns
	 */
	select(path) {
		const index = isNil(path) ? this.activeIndex : this.getIndexFromPath(path)
		this.selected = [this.items[index]]
		this.activeIndex = index
		return true
	}

	toggleExpansion() {
		return false
	}
}
