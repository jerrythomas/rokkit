/**
 * Handles navigation through a flattened data structure
 */
export class Traversal {
	#dataProvider
	#currentKey = $state(null)
	#currentIndex = $derived(this.getCurrentIndex())

	/**
	 * @param {object} dataProvider - Data provider component
	 */
	constructor(dataProvider) {
		this.#dataProvider = dataProvider
	}

	/**
	 * Gets the current focused key
	 * @returns {string|null} The current key or null if none selected
	 */
	get currentKey() {
		return this.#currentKey
	}

	/**
	 * Gets the current focused index
	 * @returns {number} The current index or -1 if none selected
	 */
	get currentIndex() {
		return this.#currentIndex
	}

	/**
	 * Gets the currently focused item
	 * @returns {object|null} The focused item or null
	 */
	get focused() {
		return this.#currentKey ? this.#dataProvider.getItemByKey(this.#currentKey) : null
	}

	/**
	 * Calculates the current index based on the current key
	 * @private
	 * @returns {number} The current index or -1 if not found
	 */
	getCurrentIndex() {
		if (!this.#currentKey) return -1

		const index = this.#dataProvider.getIndexForKey(this.#currentKey)
		return index !== undefined ? index : -1
	}

	/**
	 * Focuses on an item by its key
	 * @param {string} key - Key of the item to focus
	 * @returns {boolean} True if focus changed, false otherwise
	 */
	moveToKey(key) {
		if (!key || !this.#dataProvider.lookup.has(key)) return false
		if (this.#currentKey === key) return false

		this.#currentKey = key
		return true
	}

	/**
	 * Focuses on an item by its index in the flattened list
	 * @param {number} index - Index of the item to focus
	 * @returns {boolean} True if focus changed, false otherwise
	 */
	moveToIndex(index) {
		const nodes = this.#dataProvider.nodes

		if (index < 0 || index >= nodes.length) return false
		if (this.#currentIndex === index) return false

		this.#currentKey = nodes[index].key
		return true
	}

	/**
	 * Focuses on an item by finding its value in the data
	 * @param {*} value - Value to find and focus
	 * @returns {boolean} True if found and focused, false otherwise
	 */
	moveToValue(value) {
		if (!value) {
			this.#currentKey = null
			return true
		}

		const key = this.#dataProvider.getKeyForValue(value)
		if (!key) return false

		return this.moveToKey(key)
	}

	/**
	 * Moves focus to the previous visible item
	 * @returns {boolean} True if moved, false if at the beginning
	 */
	movePrev() {
		if (this.#currentIndex > 0) {
			return this.moveToIndex(this.#currentIndex - 1)
		} else if (this.#currentIndex < 0 && this.#dataProvider.nodes.length > 0) {
			return this.moveLast() // If not focused, go to last item
		}
		return false
	}

	/**
	 * Moves focus to the next visible item
	 * @returns {boolean} True if moved, false if at the end
	 */
	moveNext() {
		if (this.#currentIndex < this.#dataProvider.nodes.length - 1) {
			return this.moveToIndex(this.#currentIndex + 1)
		}
		return false
	}

	/**
	 * Moves focus to the first item
	 * @returns {boolean} True if moved, false otherwise
	 */
	moveFirst() {
		return this.#dataProvider.nodes.length > 0 ? this.moveToIndex(0) : false
	}

	/**
	 * Moves focus to the last item
	 * @returns {boolean} True if moved, false otherwise
	 */
	moveLast() {
		const lastIndex = this.#dataProvider.nodes.length - 1
		return lastIndex >= 0 ? this.moveToIndex(lastIndex) : false
	}
}
