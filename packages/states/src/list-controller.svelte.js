import { FieldMapper, defaultFields } from '@rokkit/core'
import { equals } from 'ramda'
import { SvelteSet } from 'svelte/reactivity'
import { deriveLookupWithProxy, flatVisibleNodes } from './derive.svelte'

export class ListController {
	items = $state(null)
	fields = defaultFields
	mappers = []
	#options = $state({})
	// lookup = new Map()
	selectedKeys = new SvelteSet()
	focusedKey = $state(null)
	#currentIndex = -1

	selected = $derived(Array.from(this.selectedKeys).map((key) => this.lookup.get(key).value))
	focused = $derived(this.lookup.get(this.focusedKey)?.value)
	data = $derived(flatVisibleNodes(this.items, this.fields))
	lookup = $derived(deriveLookupWithProxy(this.items, this.fields))

	constructor(items, value, fields, options) {
		this.items = items
		this.fields = { ...defaultFields, ...fields }
		this.mappers.push(new FieldMapper(fields))
		this.#options = { multiselect: false, ...options }
		this.init(value)
	}

	/**
	 * @private
	 * @param {Array<*>} items
	 * @param {*} value
	 */
	init(value) {
		// items.forEach((item, index) => this.lookup.set(String(index), item))
		this.moveToValue(value)
	}

	get isNested() {
		return this.mappers.length > 1
	}

	get currentKey() {
		return this.focusedKey
	}

	/**
	 * @private
	 * @param {*} value
	 * @returns
	 */
	findByValue(value) {
		const index = this.data.findIndex((row) => equals(row.value, value))
		return index < 0 ? { index } : { index, ...this.data[index] }
	}

	/**
	 * @private
	 * @param {*} value
	 * @returns
	 */
	moveToValue(value = null) {
		const { index, key } = this.findByValue(value)

		this.selectedKeys.clear()
		if (index >= 0) {
			this.moveToIndex(index)
			this.selectedKeys.add(key)
		} else {
			this.focusedKey = null
			this.#currentIndex = -1
		}
		return true
	}

	/**
	 *
	 * @param {string} path
	 * @returns
	 */
	moveTo(path) {
		const index = Number(path)
		return this.moveToIndex(index)
	}

	/**
	 * @private
	 * @param {number} index
	 */
	moveToIndex(index) {
		if (index >= 0 && index < this.data.length && this.#currentIndex !== index) {
			this.#currentIndex = index
			this.focusedKey = this.data[index].key
			return true
		}
		return false
	}

	movePrev() {
		if (this.#currentIndex > 0) {
			return this.moveToIndex(this.#currentIndex - 1)
		} else if (this.#currentIndex < 0) {
			return this.moveLast()
		}
		return false
	}

	moveNext() {
		if (this.#currentIndex < this.data.length - 1) {
			return this.moveToIndex(this.#currentIndex + 1)
		}
		return false
	}

	moveFirst() {
		return this.moveToIndex(0)
	}

	moveLast() {
		return this.moveToIndex(this.data.length - 1)
	}

	/**
	 * Toggles the selection.
	 * @private
	 * @param {string} key
	 */
	toggleSelection(key) {
		if (this.selectedKeys.has(key)) {
			this.selectedKeys.delete(key)
		} else {
			this.selectedKeys.add(key)
		}

		return true
	}

	/**
	 *
	 * @param {string} selectedKey
	 * @returns
	 */
	select(selectedKey) {
		const key = selectedKey ?? this.focusedKey

		if (!this.lookup.has(key)) return false

		if (this.focusedKey !== key) {
			const { index } = this.findByValue(this.lookup.get(key).value)
			this.moveToIndex(index)
		}

		if (!this.selectedKeys.has(key)) {
			this.selectedKeys.clear()
			this.selectedKeys.add(key)
		}

		return true
	}

	/**
	 *
	 * @param {string} selectedKey
	 * @returns
	 */
	extendSelection(selectedKey) {
		const key = selectedKey ?? this.focusedKey

		if (!this.lookup.has(key)) return false

		if (this.#options.multiselect) {
			return this.toggleSelection(key)
		} else {
			return this.select(key)
		}
	}
}
