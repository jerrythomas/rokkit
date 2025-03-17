import { BaseProxy } from './base-proxy.svelte.js'
import { NodeProxy } from './node-proxy.svelte.js'

/**
 * Manages a hierarchical tree of nodes with selection, focus and expansion capabilities
 */
export class NestedProxy extends BaseProxy {
	/**
	 * Creates a new NestedProxy
	 *
	 * @param {any[]} data - Original hierarchical data array
	 * @param {Object} fields - Field mappings
	 * @param {Object} options - Configuration options
	 */
	constructor(data = null, fields = {}, options = {}) {
		// Default options for tree structures
		const defaultTreeOptions = {
			expandedByDefault: false
		}

		super(data, fields, { ...defaultTreeOptions, ...options })
		// this._refreshFlatNodes()
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
	 * Moves focus to the specified target (index, path, id, or node)
	 *
	 * @param {number|number[]|string|Object} target - Target to move to
	 * @returns {boolean} - Whether the move was successful
	 */
	moveTo(target) {
		const path = Array.isArray(target) ? target : [target]
		const targetNode = this.getNodeByPath(path)

		if (!targetNode) return false

		// Ensure the node is visible (parents are expanded)
		if (!this.ensureVisible(targetNode)) return false

		// Update focus
		if (this.currentNode) {
			this.currentNode.focused = false
		}

		this.currentNode = targetNode
		this.currentNode.focused = true

		return true
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
	 * Selects the current node
	 *
	 * @returns {boolean} - Whether the selection was successful
	 */
	select() {
		if (!this.currentNode) return false
		if (!this.options.multiSelect) {
			this.selectedNodes.forEach((node) => {
				node.selected = false
			})
			this.selectedNodes.clear()
		}

		// Select the current node
		this.currentNode.selected = true
		const nodeId = this.currentNode.id
		this.selectedNodes.set(nodeId, this.currentNode)

		return true
	}

	/**
	 * Toggles selection on the current node (for multi-select)
	 *
	 * @returns {boolean} - Whether the operation was successful
	 */
	extendSelection() {
		if (!this.currentNode) return false

		if (this.options.multiSelect) {
			// Toggle selection
			this.currentNode.selected = !this.currentNode.selected
			const nodeId = this.currentNode.id

			if (nodeId) {
				if (this.currentNode.selected) {
					this.selectedNodes.set(nodeId, this.currentNode)
				} else {
					this.selectedNodes.delete(nodeId)
				}
			}
		} else {
			// In single select mode, just select the node
			return this.select()
		}

		return true
	}

	/**
	 * Expand the current node
	 *
	 * @returns {boolean} - Whether the node was expanded
	 */
	expand() {
		if (!this.currentNode || !this.currentNode.hasChildren() || this.currentNode.expanded) {
			return false
		}

		this.currentNode.expanded = true
		this._refreshFlatNodes()
		return true
	}

	/**
	 * Collapse the current node
	 *
	 * @returns {boolean} - Whether the node was collapsed
	 */
	collapse() {
		if (!this.currentNode || !this.currentNode.hasChildren() || !this.currentNode.expanded) {
			return false
		}

		this.currentNode.expanded = false
		this._refreshFlatNodes()
		return true
	}

	/**
	 * Toggle expanded/collapsed state of current node
	 *
	 * @returns {boolean} - Whether the state changed
	 */
	toggleExpansion() {
		if (!this.currentNode || !this.currentNode.hasChildren()) {
			return false
		}

		this.currentNode.expanded = !this.currentNode.expanded
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
}
