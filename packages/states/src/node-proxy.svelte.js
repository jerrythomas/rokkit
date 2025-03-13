import { has } from 'ramda'

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
	constructor(item, path, mapper, parent = null) {
		this.original = item
		this.path = path
		this.depth = path.length - 1
		this.mapping = mapper
		this.parent = parent

		// Set id from original data or path
		if (has(this.mapping.fields.id, item)) {
			this.id = String(item[this.mapping.fields.id])
		} else {
			this.id = this.getKey()
		}

		// Set expanded state from original data
		if (has(this.mapping.fields.isOpen, item)) {
			this.expanded = Boolean(item[this.mapping.fields.isOpen])
		}

		// Set selected state from original data
		if (has(this.mapping.fields.isSelected, item)) {
			this.selected = Boolean(item[this.mapping.fields.isSelected])
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
		const mappedField = this.mapping.fields[fieldName]
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
		return this.mapping.getText(this.original) || ''
	}

	/**
	 * Get the icon for this node
	 * @returns {string|null}
	 */
	get icon() {
		return this.mapping.getIcon(this.original)
	}

	/**
	 * Get formatted text using a formatter function
	 * @param {Function} formatter - Function to format the text
	 * @returns {string}
	 */
	formattedText(formatter) {
		return this.mapping.getFormattedText(this.original, formatter)
	}

	/**
	 * Toggles the expanded state of this node
	 */
	toggle() {
		this.expanded = !this.expanded

		// Update original data if it has the isOpen field
		if (has(this.mapping.fields.isOpen, this.original)) {
			this.original[this.mapping.fields.isOpen] = this.expanded
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
	 * Adds a child node proxy from an existing data item
	 * @param {any} childData - Child data to add (already exists in original data)
	 * @returns {NodeProxy} - The newly created child node proxy
	 */
	addChild(childData, index = 0) {
		if (this.children.length === 0) {
			this.original[this.mapping.fields.children] = []
		}
		if (index < 0 || index > this.children.length) {
			index = this.children.length
		}

		this.original[this.mapping.fields.children].splice(index, 0, childData)
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
		const child = this.original[this.mapping.fields.children][index]
		this.original[this.mapping.fields.children].splice(index, 1)
		this._refreshAllChildren(this.path)
		return child
	}

	/**
	 * Removes all children from this node
	 * @private
	 */
	_removeAllChildren() {
		// Clean up all child nodes
		this.children.forEach((child) => child.destroy())
		// Clear the children array
		this.children = []
	}
	/**
	 * Removes all children from this node
	 * @private
	 */
	_refreshAllChildren(path) {
		if (this.children.length > 0) this._removeAllChildren()
		if (this.mapping.hasChildren(this.original)) {
			this.original[this.mapping.fields.children].forEach((child, index) => {
				const childNode = new NodeProxy(
					child,
					[...path, index],
					this.mapping.getChildMapping(),
					this
				)
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
