import { has, equals, pick } from 'ramda'
import { SvelteMap } from 'svelte/reactivity'
import { DEFAULT_EVENTS } from './constants'
import { FieldMapper, getKeyFromPath } from '@rokkit/core'

export class DataWrapper {
	/* @type number[] */
	#path = []
	#events = {}
	#init = false
	#options = { multiselect: false, autoCloseSiblings: false }

	items = null
	data = $state(null)
	value = $state(null)
	mapping = new FieldMapper()
	currentNode = $state(null)
	selected = new SvelteMap()

	constructor(items, mapper, value, options = {}) {
		this.items = items
		this.data = items
		if (mapper) this.mapping = mapper

		this.#events = { ...DEFAULT_EVENTS, ...options.events }
		this.#options = { ...options, ...pick(['multiselect', 'autoCloseSiblings'], options) }
		this.value = value

		this.#init = true
		this.moveTo(this.findPathToItem(value))
		this.#init = false
	}

	/**
	 * Finds an item in a tree structure and returns the path as array of indices
	 * @param {*} value - The value to find
	 * @param {number[]} parent - The current path being explored
	 * @returns {number[]|null} - Array of indices representing path to item, or null if not found
	 */
	findPathToItem(value, parent = []) {
		const children = this.mapping.getChildrenByPath(this.data, parent)
		// Direct child check
		const directIndex = children.findIndex((item) => equals(item, value))
		if (directIndex !== -1) {
			return [...parent, directIndex]
		}

		// Recursive search in children
		return children.reduce((path, _, index) => {
			if (path.length > 0) return path
			if (!this.mapping.hasChildren(children[index])) return []

			return this.findPathToItem(value, [...parent, index])
		}, [])
	}

	#getLastVisibleDescendant(node, nodePath) {
		if (!this.mapping.hasChildren(node) || !this.mapping.isExpanded(node)) {
			return { node, path: nodePath }
		}

		const children = this.mapping.getChildren(node)
		if (children.length === 0) {
			return { node, path: nodePath }
		}

		const lastChildIndex = children.length - 1
		const lastChild = children[lastChildIndex]
		return this.#getLastVisibleDescendant(lastChild, [...nodePath, lastChildIndex])
	}

	#getPreviousSiblingPath() {
		const currentIndex = this.#path[this.#path.length - 1]
		const prevSiblingPath = [...this.#path.slice(0, -1), currentIndex - 1]
		const prevSibling = this.mapping.getItemByPath(this.data, prevSiblingPath)

		if (this.mapping.isExpanded(prevSibling)) {
			const { path } = this.#getLastVisibleDescendant(prevSibling, prevSiblingPath)
			return path
		} else {
			return prevSiblingPath
		}
	}

	#getNextSiblingPath(inputPath) {
		const parentPath = inputPath.slice(0, -1)
		const currentIndex = Number(inputPath[inputPath.length - 1])

		const siblings = this.mapping.getChildrenByPath(this.data, parentPath)
		if (currentIndex < siblings.length - 1) {
			return [...parentPath, currentIndex + 1]
		} else if (parentPath.length > 0) {
			return this.#getNextSiblingPath(parentPath)
		}
		return null
	}

	emit(type, data) {
		if (!this.#init && has(type, this.#events)) this.#events[type](data)
	}

	moveTo(path) {
		if (!path) return
		const currentPath = Array.isArray(path) ? path : [path]

		if (equals(currentPath, this.#path)) return

		this.#path = currentPath
		if (currentPath.length === 0) {
			this.currentNode = null
		} else {
			this.currentNode = this.mapping.getItemByPath(this.data, currentPath)
			this.emit('move', { path: this.#path, node: this.currentNode })
		}
	}
	movePrev() {
		let currentPath = [0]
		if (this.#path.length === 0) this.moveTo([0])

		// Return false if at root level first item
		if (this.#path.length === 1 && this.#path[0] === 0) {
			return
		}

		// Get previous sibling index
		const currentIndex = this.#path[this.#path.length - 1]
		if (currentIndex > 0) {
			// Has previous sibling
			currentPath = this.#getPreviousSiblingPath()
		} else {
			// Move to parent
			currentPath = this.#path.slice(0, -1)
		}
		this.moveTo(currentPath)
	}

	moveNext() {
		if (this.#path.length === 0) {
			this.moveTo([0])
			return
		}

		const currentNode = this.currentNode

		// If current node is expanded and has children, move to first child
		if (this.mapping.isExpanded(currentNode) && this.mapping.hasChildren(currentNode)) {
			this.moveTo([...this.#path, 0])
			return
		}

		// Try to move to next sibling
		const nextSiblingPath = this.#getNextSiblingPath(this.#path)
		if (nextSiblingPath) {
			this.moveTo(nextSiblingPath)
			return
		}
	}

	collapse() {
		if (!this.mapping.isExpanded(this.currentNode)) return
		this.toggleExpansion()
	}

	expand() {
		if (this.mapping.isExpanded(this.currentNode)) return
		this.toggleExpansion()
	}

	collapseSiblings() {
		if (!this.#options.autoCloseSiblings || !this.mapping.isExpanded(this.currentNode)) return

		const parentPath = this.#path.slice(0, -1)
		const siblings = this.mapping.getChildrenByPath(this.data, parentPath)
		const currentIndex = this.#path[this.#path.length - 1]

		siblings.forEach((sibling, index) => {
			if (currentIndex !== index && this.mapping.isExpanded(sibling)) {
				this.mapping.toggleExpansion(sibling)
			}
		})
	}

	toggleExpansion() {
		if (!this.currentNode || !this.mapping.hasChildren(this.currentNode)) return

		const eventType = this.mapping.isExpanded(this.currentNode) ? 'collapse' : 'expand'
		this.mapping.toggleExpansion(this.currentNode)
		this.collapseSiblings()
		this.emit(eventType, { path: this.#path, node: this.currentNode })
	}

	select(path = null) {
		this.moveTo(path)

		if (this.currentNode) {
			this.value = this.mapping.getItemByPath(this.data, this.#path)
			this.selected.clear()
			this.selected.set(getKeyFromPath(this.#path), this.currentNode)
			this.emit('select', {
				path: this.#path,
				node: this.currentNode,
				selected: this.selected
			})
		}
	}

	#toggleSelection() {
		if (!this.currentNode) return

		const isSelected = this.selected.has(getKeyFromPath(this.#path))

		if (isSelected) {
			this.selected.delete(getKeyFromPath(this.#path))
		} else {
			this.selected.set(getKeyFromPath(this.#path), this.currentNode)
		}

		this.emit('select', {
			path: this.#path,
			node: this.currentNode,
			selected: this.selected
		})
	}

	extendSelection(path = null) {
		this.moveTo(path)
		if (this.#options.multiselect) {
			this.#toggleSelection()
		} else {
			this.select()
		}
	}
}
