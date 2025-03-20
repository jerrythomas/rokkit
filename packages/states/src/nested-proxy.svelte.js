import { BaseProxy } from './base-proxy.svelte.js'
import { NodeProxy } from './node-proxy.svelte.js'
import { equals } from 'ramda'

/**
 * Manages a hierarchical tree of nodes with selection, focus and expansion capabilities
 */
export class NestedProxy extends BaseProxy {
	/**
	 * Creates a new NestedProxy
	 *
	 * @param {any[]} data - Original hierarchical data array
	 * @param {any} value - Initial value for the proxy
	 * @param {Object} fields - Field mappings
	 * @param {Object} options - Configuration options
	 */
	constructor(data, value, fields = {}, options = {}) {
		// Default options for tree structures
		const defaultTreeOptions = {
			expandedByDefault: false
		}

		super(data, value, fields, { ...defaultTreeOptions, ...options })
		this.moveToValue(value)
		// this._refreshFlatNodes()
	}

	/**
	 * Refreshes the flatNodes
	 * @private
	 */
	_refreshFlatNodes(nodes = null) {
		if (!nodes) {
			this.visibleNodes = []
			this._refreshFlatNodes(this.nodes)
		} else {
			nodes.forEach((node) => {
				this.visibleNodes.push(node)
				if (node.hasChildren() && node.expanded) {
					this._refreshFlatNodes(node.children)
				}
			})
		}
	}

	/**
	 * Processes hierarchical data into node proxies
	 *
	 * @private
	 * @param {any[]} items - Items to process
	 */
	processNodes(items) {
		if (!items || !Array.isArray(items)) return

		this.nodes = []
		items.forEach((item, index) => {
			const node = new NodeProxy(item, [index], this.fields)
			this.nodes.push(node)
		})
		this._refreshFlatNodes()
	}

	/**
	 * Updates the proxy with new data
	 *
	 * @param {any[]} data - New hierarchical data to use
	 * @returns {NestedProxy} - This proxy for method chaining
	 */
	update(data) {
		this.data = data || null
		this.reset()

		if (!data) {
			this.visibleNodes = []
			return this
		}

		// Create node tree and flatten visible nodes
		this.processNodes(data)
		return this
	}

	/**
	 * Moves focus to the specified target (index, path)
	 *
	 * @param {number|number[]} target - index or path to move to
	 * @returns {boolean} - Whether the move was successful
	 */
	moveTo(target) {
		const path = Array.isArray(target) ? target : [target]
		const targetNode = this.getNodeByPath(path)

		if (!targetNode) return false

		// Update focus
		if (this.currentNode) {
			this.currentNode.focused = false
		}

		this.currentNode = targetNode
		this.currentNode.focused = true

		return true
	}

	/**
	 * Moves focus to the next visible node
	 *
	 * @returns {boolean} - Whether the move was successful
	 */
	moveNext() {
		if (!this.visibleNodes.length) return false

		let nextIndex = 0

		if (this.currentNode) {
			const currentIndex = this.visibleNodes.indexOf(this.currentNode)
			nextIndex = currentIndex + 1

			// If at end of list, stay at current position
			if (nextIndex >= this.visibleNodes.length) {
				return false
			}
		}

		return this.moveTo(nextIndex)
	}

	/**
	 * Moves focus to the previous visible node
	 *
	 * @returns {boolean} - Whether the move was successful
	 */
	movePrev() {
		if (!this.visibleNodes.length) return false

		if (!this.currentNode) {
			return this.moveTo(this.visibleNodes.length - 1)
		}

		const currentIndex = this.visibleNodes.indexOf(this.currentNode)
		const prevIndex = currentIndex - 1

		// If at start of list, stay at current position
		if (prevIndex < 0) {
			return false
		}

		return this.moveTo(prevIndex)
	}

	/**
	 * Expand the current node
	 *
	 * @param {number[]} [path] - The path to the node to expand
	 * @returns {boolean} - Whether the node was expanded
	 */
	expand(path) {
		const node = path ? this.getNodeByPath(path) : this.currentNode
		if (!node || !node.hasChildren() || node.expanded) {
			return false
		}

		node.expanded = true
		this._refreshFlatNodes()
		return true
	}

	/**
	 * Collapse the current node
	 *
	 * @param {number[]} [path] - The path to the node to collapse
	 * @returns {boolean} - Whether the node was collapsed
	 */
	collapse(path) {
		const node = path ? this.getNodeByPath(path) : this.currentNode
		if (!node || !node.hasChildren() || !node.expanded) {
			return false
		}

		node.expanded = false
		this._refreshFlatNodes()
		return true
	}

	/**
	 * Toggle expanded/collapsed state of current node
	 *
	 * @param {number[]} [path] - The path to the node to toggle expansion
	 * @returns {boolean} - Whether the state changed
	 */
	toggleExpansion(path) {
		const node = path ? this.getNodeByPath(path) : this.currentNode

		if (!node || !node.hasChildren()) {
			return false
		}

		node.expanded = !node.expanded
		this._refreshFlatNodes()
		return true
	}

	/**
	 * Expands all nodes
	 *
	 * @returns {NestedProxy} - This proxy for method chaining
	 */
	expandAll() {
		this.visibleNodes.forEach((node) => {
			node.expandAll()
		})

		this._refreshFlatNodes()
		return this
	}

	/**
	 * Collapses all nodes
	 *
	 * @returns {NestedProxy} - This proxy for method chaining
	 */
	collapseAll() {
		this.visibleNodes.forEach((node) => {
			node.collapseAll()
		})

		this._refreshFlatNodes()
		return this
	}

	/**
	 * Resets selection and expansion state
	 *
	 * @returns {NestedProxy} - This proxy for method chaining
	 */
	reset() {
		// Clear focus
		if (this.currentNode) {
			this.currentNode.focused = false
			this.currentNode = null
		}
		if (this.options.expandedByDefault) this.expandAll()
		this.nodes.forEach((node) => node.resetStates())
		this.selectedNodes.clear()
		this._refreshFlatNodes()

		return this
	}

	/**
	 * Ensures a node is visible by expanding its ancestors
	 *
	 * @param {NodeProxy} node - Node to make visible
	 * @returns {boolean} - Whether the node is now visible
	 */
	ensureVisible(node) {
		if (!node || !node.path || node.path.length <= 1) return true

		for (let i = 1; i < node.path.length; i++) {
			const parentNode = this.getNodeByPath(node.path.slice(0, i))
			parentNode.expanded = true
		}
		return true
	}

	/**
	 * Finds a node by value and makes it the current & active node
	 *
	 * @param {any} value
	 * @returns
	 */
	moveToValue(value) {
		if (!value || equals(this.currentNode?.value, value)) return false

		const targetNode = this.find((node) => equals(node.value, value))

		if (targetNode) {
			this.ensureVisible(targetNode)
			this.moveTo(targetNode.path)
			this.select()
			return true
		}
		return false
	}
}
