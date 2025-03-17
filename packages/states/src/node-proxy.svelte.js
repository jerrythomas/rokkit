import { has, isNil } from 'ramda'
import { defaultFields } from '@rokkit/core'
/**
 * Represents an individual node within a data structure
 */
export class NodeProxy {
	/** @type {any} Original data item */
	original
	/** @type {number[]} Path to this node */
	path
	/** @type {number} Depth in the hierarchy */
	depth

	/** @type {string} Unique identifier */
	id

	/** @type {boolean} Whether this node is expanded */
	expanded = $state(false)

	/** @type {boolean} Whether this node is selected  */
	selected = $state(false)

	/** @type {boolean} Whether this node has focus */
	focused = $state(false)

	/** @type {NodeProxy|null} Parent node */
	parent = null

	/** @type {NodeProxy[]} Child nodes */
	children = $state([])

	/** @type {import('@rokkit/core').FieldMapper} Field mapper */
	mapping

	/**
	 * Creates a new NodeProxy
	 *
	 * @param {any} item - Original data item
	 * @param {number[]} path - Path to this node
	 * @param {import('./field-mapper.js').FieldMapper} mapper - Field mapper
	 * @param {NodeProxy|null} parent - Parent node
	 */
	constructor(item, path, fields, parent = null) {
		this.original = item
		this.path = path
		this.depth = path.length - 1
		this.parent = parent
		this.fields = { ...defaultFields, ...fields }

		// Set id from original data or path
		if (has(this.fields.id, item)) {
			this.id = String(item[this.fields.id])
		} else {
			this.id = this.getKey()
		}

		// Set expanded state from original data
		if (has(this.fields.isOpen, item)) {
			this.expanded = Boolean(item[this.fields.isOpen])
		}

		// Set selected state from original data
		if (has(this.fields.isSelected, item)) {
			this.selected = Boolean(item[this.fields.isSelected])
		}

		this._refreshAllChildren(path)
	}

	/**
	 * Gets a mapped attribute from the original item
	 *
	 * @param {string} fieldName - Name of the field to get
	 * @returns {any|null} - The attribute value or null if not found
	 */
	get(fieldName) {
		const mappedField = this.fields[fieldName]
		if (!mappedField || !has(mappedField, this.original)) {
			return null
		}
		return this.original[mappedField]
	}

	/**
	 * Get the display text for this node
	 * @returns {string}
	 */
	get text() {
		return this.get('text')
	}

	/**
	 * Get the icon for this node
	 * @returns {string|null}
	 */
	get icon() {
		return this.get('icon')
	}

	/**
	 * Get formatted text using a formatter function
	 * @param {Function} formatter - Function to format the text
	 * @returns {string}
	 */
	formattedText(formatter) {
		const text = this.get('text')
		if (isNil(text)) return ''
		if (typeof formatter !== 'function') return text.toString()
		return formatter(text, this.get('currency'))
	}

	/**
	 * Toggles the expanded state of this node
	 */
	toggle() {
		this.expanded = !this.expanded

		// Update original data if it has the isOpen field
		if (has(this.fields.isOpen, this.original)) {
			this.original[this.fields.isOpen] = this.expanded
		}
		return this
	}

	/**
	 * Checks if this node has children
	 * @returns {boolean}
	 */
	hasChildren() {
		return this.children.length > 0
	}

	/**
	 * Expand all children
	 */
	expandAll() {
		if (this.hasChildren()) {
			this.expanded = true
			this.children.forEach((child) => child.expandAll())
		}
	}

	/**
	 * Collapse all children
	 */
	collapseAll() {
		if (this.hasChildren()) {
			this.children.forEach((child) => child.collapseAll())
			this.expanded = false
		}
	}

	/**
	 * Checks if this node is a leaf node (no children)
	 * @returns {boolean}
	 */
	isLeaf() {
		return !this.hasChildren()
	}

	/**
	 * Gets the path to this node
	 * @returns {number[]}
	 */
	getPath() {
		return [...this.path]
	}

	/**
	 * Gets a string representation of the path for use as a key
	 * @returns {string}
	 */
	getKey() {
		return this.path.join('-')
	}

	/**
	 * Adds a child node proxy from an existing data item.
	 * If index is provided, the child is inserted at that index, otherwise it is appended to the end
	 * @param {any} childData - Child data to add (already exists in original data)
	 * @returns {NodeProxy} - The newly created child node proxy
	 */
	addChild(childData, index = -1) {
		if (this.children.length === 0) {
			this.original[this.fields.children] = []
		}
		if (index < 0 || index > this.children.length) {
			index = this.children.length
		}

		this.original[this.fields.children].splice(index, 0, childData)
		this._refreshAllChildren(this.path)
	}

	/**
	 * Removes a child node by index
	 * @param {number} index - Index of the child to remove
	 * @returns {boolean} - Whether the removal was successful
	 */
	removeChild(index) {
		if (index < 0 || index >= this.children.length) {
			return null
		}
		const child = this.original[this.fields.children][index]
		this.original[this.fields.children].splice(index, 1)
		this._refreshAllChildren(this.path)
		return child
	}

	/**
	 * Removes all children from this node
	 * @private
	 */
	_removeAllChildren() {
		this.children.forEach((child) => child.destroy())
		this.children = []
	}

	/**
	 * Checks if the original data has children
	 * @private
	 */
	_hasChildren() {
		const childAttr = this.fields.children
		return has(childAttr, this.original) && Array.isArray(this.original[childAttr])
	}

	/**
	 * Removes all children from this node
	 * @private
	 */
	_refreshAllChildren(path) {
		if (this.children.length > 0) this._removeAllChildren()
		if (this._hasChildren()) {
			const childFields = this.fields.fields ?? this.fields
			this.original[this.fields.children].forEach((child, index) => {
				const childNode = new NodeProxy(child, [...path, index], childFields, this)
				this.children.push(childNode)
			})
		}
	}

	/**
	 * Destroys this node, cleaning up references
	 */
	destroy() {
		// Clean up all children first
		this.children.forEach((child) => child.destroy())

		// Clear references
		this.children = []
		this.parent = null
	}

	/**
	 * Clear selected, focused states
	 */
	resetStates() {
		this.selected = false
		this.focused = false
		if (this.children.length > 0) {
			this.children.forEach((child) => child.resetStates())
		}
	}

	/**
	 * Get/Set the value for this node
	 */
	get value() {
		return this.original
	}

	set value(newValue) {
		if (typeof newValue === 'object') {
			const removedKeys = Object.keys(this.original).filter(
				(key) => !Object.keys(newValue).includes(key)
			)
			Object.entries(newValue).forEach(([k, v]) => {
				this.original[k] = v
			})
			removedKeys.forEach((key) => {
				delete this.original[key]
			})
			this._refreshAllChildren(this.path)
		} else {
			this.original = newValue
		}
	}

	/**
	 * Matches a condition on the value
	 * @param {function} condition - The condition to match
	 * @returns {boolean} - True if the condition is met, false otherwise
	 */
	match(condition) {
		return condition(this.value)
	}

	/**
	 * Find nodes matching a criteria
	 * @param {function} condition - The condition to match
	 * @returns {NodeProxy|null} - First matching node or null if no matches found
	 */
	find(condition) {
		if (this.match(condition)) return this
		let result = null
		for (let i = 0; i < this.children.length && !result; i++)
			result = this.children[i].find(condition)
		return result
	}
}
