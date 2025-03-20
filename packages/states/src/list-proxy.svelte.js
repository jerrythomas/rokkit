import { BaseProxy } from './base-proxy.svelte.js'
import { NodeProxy } from './node-proxy.svelte.js'
import { equals } from 'ramda'
/**
 * Manages a flat list of nodes with selection and focus capabilities
 */
export class ListProxy extends BaseProxy {
	/**
	 * Creates a new ListProxy
	 *
	 * @param {Object[]} data    - Original data array
	 * @param {Object}   value   - Active value in the list
	 * @param {Object}   fields  - Field mappings
	 * @param {Object}   options - Configuration options
	 */
	constructor(data, value, fields = {}, options = {}) {
		super(data, value, fields, options)
		this.moveToValue(value)
	}

	/**
	 * Updates the proxy with new data
	 *
	 * @param {any[]}    data    - New data to use
	 * @returns {ListProxy}      - This proxy for method chaining
	 */
	update(data) {
		this.data = data || null

		// Create node proxies for all items
		if (data && Array.isArray(data)) {
			this.nodes = data.map((item, index) => new NodeProxy(item, [index], this.fields))
		} else {
			this.nodes = []
		}

		this.reset()
		return this
	}

	/**
	 * Moves focus to the specified target (index or item)
	 *
	 * @param {number|object} target - Index of the node or the node item to focus
	 * @returns {boolean}            - Whether the move was successful
	 */
	moveTo(target) {
		const index = Array.isArray(target) ? target[0] : target

		// Validate index
		if (index < 0 || index >= this.nodes.length) {
			return false
		}

		// Update focus
		if (this.currentNode) this.currentNode.focused = false

		this.currentNode = this.nodes[index]
		this.currentNode.focused = true

		return true
	}

	/**
	 * Moves focus to the next node
	 *
	 * @returns {boolean} - Whether the move was successful
	 */
	moveNext() {
		if (!this.nodes.length) return false

		let nextIndex = 0

		if (this.currentNode) {
			const currentIndex = this.nodes.indexOf(this.currentNode)
			nextIndex = currentIndex + 1

			// If at end of list, stay at current position
			if (nextIndex >= this.nodes.length) {
				return false
			}
		}

		return this.moveTo(nextIndex)
	}

	/**
	 * Moves focus to the previous node
	 *
	 * @returns {boolean} - Whether the move was successful
	 */
	movePrev() {
		if (!this.nodes.length) return false

		if (!this.currentNode) {
			return this.moveTo(this.nodes.length - 1)
		}

		const currentIndex = this.nodes.indexOf(this.currentNode)
		const prevIndex = currentIndex - 1

		// If at start of list, stay at current position
		if (prevIndex < 0) {
			return false
		}

		return this.moveTo(prevIndex)
	}

	/**
	 * Finds a node by value and makes it the current & active node
	 *
	 * @param {any} value
	 * @returns
	 */
	moveToValue(value) {
		if (!value || equals(this.currentNode?.value, value)) return false

		const path = this.findPathIndex((node) => equals(node.value, value))
		if (path.length > 0) {
			this.moveTo(path)
			this.select()
			return true
		}
		return false
	}
}
