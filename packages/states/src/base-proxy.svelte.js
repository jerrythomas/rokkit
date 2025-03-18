import { defaultFields } from '@rokkit/core'

/**
 * Base class for all proxy models that provides a common interface
 * for navigation and selection operations.
 *
 * @abstract
 */
export class BaseProxy {
	/** @type {any[]} Original data array */
	data = $state(null)
	/** @type {NodeProxy|null} Currently focused node */
	nodes = $state([])
	/** @type {NodeProxy[]} Flattened array of all visible nodes */
	visibleNodes = $state([])

	/** @type {NodeProxy|null} Currently focused node */
	currentNode = $state(null)
	/** @type {Object|null} Currently focused node */
	value = $state(null)
	/** @type {Map<string, NodeProxy>} Map of selected nodes by id */
	selectedNodes = $state(new Map())

	/** @type {Object} Field mappings */
	fields

	/** @type {Object} Configuration options */
	options = {
		multiSelect: false,
		keyboardNavigation: true
	}

	/**
	 * Creates a new proxy instance
	 *
	 * @param {any[]} data - Original data
	 * @param {Object} fields - Field mappings
	 * @param {Object} options - Configuration options
	 */
	constructor(data, value, fields = {}, options = {}) {
		this.fields = { ...defaultFields, ...fields }
		this.options = { ...this.options, ...options }
		this.value = value

		this.update(data)
	}

	/**
	 * Updates the proxy with new data
	 *
	 * @param {any} data - New data to use
	 * @returns {BaseProxy} - This proxy for method chaining
	 */
	update(data) {
		this.data = data
		this.reset()
		return this
	}

	/**
	 * Resets selection state
	 *
	 * @returns {BaseProxy} - This proxy for method chaining
	 */
	reset() {
		this.selectedNodes.clear()
		this.currentNode = null
		return this
	}

	/**
	 * Move to the next item
	 *
	 * @abstract
	 * @returns {boolean} - True if moved, false otherwise
	 */
	moveNext() {
		throw new Error('moveNext() must be implemented by subclass')
	}

	/**
	 * Move to the previous item
	 *
	 * @abstract
	 * @returns {boolean} - True if moved, false otherwise
	 */
	movePrev() {
		throw new Error('movePrev() must be implemented by subclass')
	}

	/**
	 * Move to a specific target (index, path, or item)
	 *
	 * @abstract
	 * @param {any} target - Target to move to
	 * @returns {boolean} - True if moved, false otherwise
	 */
	moveTo() {
		throw new Error('moveTo() must be implemented by subclass')
	}

	/**
	 * Select the current item
	 *
	 * @abstract
	 * @returns {boolean} - True if selection changed, false otherwise
	 */
	select() {
		throw new Error('select() must be implemented by subclass')
	}

	/**
	 * Toggle/extend selection
	 *
	 * @abstract
	 * @returns {boolean} - True if selection changed, false otherwise
	 */
	extendSelection() {
		throw new Error('extendSelection() must be implemented by subclass')
	}

	/**
	 * Expand the current node
	 *
	 * @returns {boolean} - True if expanded, false otherwise
	 */
	expand() {
		// Default implementation for flat lists (no-op)
		return false
	}

	/**
	 * Collapse the current node
	 *
	 * @returns {boolean} - True if collapsed, false otherwise
	 */
	collapse() {
		// Default implementation for flat lists (no-op)
		return false
	}

	/**
	 * Toggle expanded/collapsed state
	 *
	 * @returns {boolean} - True if state changed, false otherwise
	 */
	toggleExpansion() {
		// Default implementation for flat lists (no-op)
		return false
	}

	/**
	 * Finds a node by a custom condition
	 *
	 * @param {Function} condition - Function that returns true for matching nodes
	 * @returns {NodeProxy|null} - The found node or null
	 */
	find(condition) {
		return this.nodes.find(condition) || null
	}

	/**
	 * Finds the path index by a custom condition
	 *
	 * @param {Function} condition - Function that returns true for matching nodes
	 * @returns {number[]} - path index of found node or empty array
	 */
	findPathIndex(condition) {
		const result = this.nodes.find(condition)
		return result?.path ?? []
	}

	/**
	 * Gets a node by its path
	 *
	 * @param {number[]} path - Path to the node
	 * @returns {NodeProxy|null} - The node or null if not found
	 */
	getNodeByPath(path) {
		if (!path || !path.length || !this.data) return null
		return path.reduce((currentNodes, index, depth) => {
			// If we've hit a dead end or invalid index, return null
			if (currentNodes === null || index < 0 || index >= currentNodes.length) {
				return null
			}

			// Get the node at the current index
			const node = currentNodes[index]

			// If we've reached the final depth, return the node
			if (depth === path.length - 1) return node

			// Otherwise, move to the next level (children)
			return node.children
		}, this.nodes)
	}
}
