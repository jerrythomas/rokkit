import { FieldMapper, defaultFields, getKeyFromPath, getNestedFields } from '@rokkit/core'
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
	expandedKeys = new SvelteSet()
	focusedKey = $state(null)
	#currentIndex = -1
	#anchorKey = null

	selected = $derived(Array.from(this.selectedKeys).map((key) => this.lookup.get(key).value))
	focused = $derived(this.lookup.get(this.focusedKey)?.value)
	data = $derived(flatVisibleNodes(this.items, this.fields, [], this.expandedKeys))
	lookup = $derived(deriveLookupWithProxy(this.items, this.fields))

	constructor(items, value, fields, options) {
		this.items = items
		this.fields = { ...defaultFields, ...fields }
		this.mappers.push(new FieldMapper(fields))
		this.#options = { multiselect: false, ...options }
		this.#initExpandedKeys(items, this.fields)
		this.init(value)
	}

	/**
	 * Scan items for pre-existing expanded flags and populate expandedKeys
	 * @private
	 */
	#initExpandedKeys(items, fields, path = []) {
		if (!items || !Array.isArray(items)) return
		items.forEach((item, index) => {
			if (item === null || item === undefined || typeof item !== 'object') return
			const itemPath = [...path, index]
			const children = item[fields.children]
			if (Array.isArray(children) && children.length > 0) {
				if (item[fields.expanded]) {
					this.expandedKeys.add(getKeyFromPath(itemPath))
				}
				this.#initExpandedKeys(children, getNestedFields(fields), itemPath)
			}
		})
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

	get currentIndex() {
		return this.#currentIndex
	}

	/**
	 * @private
	 * @param {*} value
	 * @returns
	 */
	findByValue(value) {
		// Try exact match first (full object comparison)
		let index = this.data.findIndex((row) => equals(row.value, value))

		// Fallback: match by extracted value field (e.g. primitive 'a' against { text: 'A', value: 'a' })
		if (index < 0) {
			const valueField = this.fields.value
			index = this.data.findIndex(
				(row) => typeof row.value === 'object' && row.value !== null && equals(row.value[valueField], value)
			)
		}

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
	 * @param {string|number} path - path key string (e.g. "0", "1-0", "2-1-3")
	 * @returns
	 */
	moveTo(path) {
		const key = String(path)
		const index = this.data.findIndex((row) => row.key === key)
		return index >= 0 ? this.moveToIndex(index) : false
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

	/**
	 * @private
	 * @param {number} index
	 * @returns {boolean}
	 */
	#isDisabled(index) {
		const item = this.data[index]?.value
		if (item === null || item === undefined || typeof item !== 'object') return false
		return item[this.fields.disabled] === true
	}

	movePrev() {
		if (this.#currentIndex < 0) return this.moveLast()
		for (let i = this.#currentIndex - 1; i >= 0; i--) {
			if (!this.#isDisabled(i)) return this.moveToIndex(i)
		}
		return false
	}

	moveNext() {
		for (let i = this.#currentIndex + 1; i < this.data.length; i++) {
			if (!this.#isDisabled(i)) return this.moveToIndex(i)
		}
		return false
	}

	moveFirst() {
		for (let i = 0; i < this.data.length; i++) {
			if (!this.#isDisabled(i)) return this.moveToIndex(i)
		}
		return false
	}

	moveLast() {
		for (let i = this.data.length - 1; i >= 0; i--) {
			if (!this.#isDisabled(i)) return this.moveToIndex(i)
		}
		return false
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

		this.#anchorKey = key
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
			this.#anchorKey = key
			return this.toggleSelection(key)
		} else {
			return this.select(key)
		}
	}

	/**
	 * Select all non-disabled items between the anchor and the given key (inclusive).
	 * Used for Shift+click range selection in multiselect mode.
	 * @param {string} selectedKey
	 * @returns {boolean}
	 */
	selectRange(selectedKey) {
		const key = selectedKey ?? this.focusedKey
		if (!this.lookup.has(key)) return false

		if (!this.#options.multiselect) return this.select(key)

		const anchorKey = this.#anchorKey ?? this.focusedKey
		if (!anchorKey) return this.select(key)

		const anchorIndex = this.data.findIndex((row) => row.key === anchorKey)
		const targetIndex = this.data.findIndex((row) => row.key === key)
		if (anchorIndex < 0 || targetIndex < 0) return false

		const start = Math.min(anchorIndex, targetIndex)
		const end = Math.max(anchorIndex, targetIndex)

		this.selectedKeys.clear()
		for (let i = start; i <= end; i++) {
			if (!this.#isDisabled(i)) {
				this.selectedKeys.add(this.data[i].key)
			}
		}

		// Move focus but don't change anchor (anchor stays for subsequent Shift+clicks)
		this.moveToIndex(targetIndex)
		return true
	}

	update(items) {
		this.items = items
	}
}
