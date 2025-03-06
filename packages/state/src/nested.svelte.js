import { has, equals } from 'ramda'
import { SvelteMap } from 'svelte/reactivity'
import { DEFAULT_EVENTS } from './constants'
import { FieldMapper } from '@rokkit/core'

export class DataWrapper {
	#mapper = new FieldMapper()
	#path = []
	#events = {}
	#multiselect = false
	items = null
	data = null
	currentNode = $state(null)
	selected = new SvelteMap()

	constructor(items, mapper, { events, multiselect = false }) {
		this.items = items
		this.data = items
		if (mapper) {
			this.#mapper = mapper
		}
		this.#path = [0]
		this.#events = { ...DEFAULT_EVENTS, ...events }
		this.#multiselect = multiselect
		this.currentNode = this.#mapper.getItemByPath(this.data, this.#path)
	}

	#getLastVisibleDescendant(node, nodePath) {
		if (!this.#mapper.hasChildren(node) || !this.#mapper.isExpanded(node)) {
			return { node, path: nodePath }
		}

		const children = this.#mapper.getChildren(node)
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
		const prevSibling = this.#mapper.getItemByPath(this.data, prevSiblingPath)

		if (this.#mapper.isExpanded(prevSibling)) {
			const { path } = this.#getLastVisibleDescendant(prevSibling, prevSiblingPath)
			return path
		} else {
			return prevSiblingPath
		}
	}

	#getNextSiblingPath(inputPath) {
		const parentPath = inputPath.slice(0, -1)
		const currentIndex = inputPath[inputPath.length - 1]

		const siblings = this.#mapper.getChildrenByPath(this.data, parentPath)

		if (currentIndex < siblings.length - 1) {
			return [...parentPath, currentIndex + 1]
		} else if (parentPath.length > 0) {
			return this.#getNextSiblingPath(parentPath)
		}
		return null
	}

	emit(type, data) {
		if (has(type, this.#events)) this.#events[type](data)
	}

	moveTo(path) {
		if (!path) return
		const currentPath = Array.isArray(path) ? path : [path]

		if (!equals(currentPath, this.#path)) {
			this.#path = currentPath
			if (currentPath.length === 0) {
				this.currentNode = null
			} else {
				this.currentNode = this.#mapper.getItemByPath(this.data, this.#path)
				this.emit('move', { path: this.#path, node: this.currentNode })
			}
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
		if (this.#mapper.isExpanded(currentNode) && this.#mapper.hasChildren(currentNode)) {
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
		// if (!this.currentNode || !this.#mapper.hasChildren(this.currentNode)) return
		if (!this.#mapper.isExpanded(this.currentNode)) return
		this.toggleExpansion()
		// this.#mapper.toggleExpansion(this.currentNode)
		// this.emit('collapse', { path: this.#path, node: this.currentNode })
	}

	expand() {
		// if (!this.currentNode || !this.#mapper.hasChildren(this.currentNode)) return
		if (this.#mapper.isExpanded(this.currentNode)) return
		this.toggleExpansion()
		// this.#mapper.toggleExpansion(this.currentNode)
		// this.emit('expand', { path: this.#path, node: this.currentNode })
	}

	toggleExpansion() {
		if (!this.currentNode || !this.#mapper.hasChildren(this.currentNode)) return

		const eventType = this.#mapper.isExpanded(this.currentNode) ? 'collapse' : 'expand'
		this.#mapper.toggleExpansion(this.currentNode)
		this.emit(eventType, { path: this.#path, node: this.currentNode })
	}

	select(path = null) {
		this.moveTo(path)

		if (this.currentNode) {
			this.selected.clear()
			this.selected.set(this.#pathKey(), this.currentNode)
			this.emit('select', {
				path: this.#path,
				node: this.currentNode,
				selected: this.selected
			})
		}
	}

	#pathKey() {
		return this.#path.join('-')
	}
	#toggleSelection() {
		if (!this.currentNode) return

		const isSelected = this.selected.has(this.#pathKey())

		if (isSelected) {
			this.selected.delete(this.#pathKey())
		} else {
			this.selected.set(this.#pathKey(), this.currentNode)
		}

		this.emit('select', {
			path: this.#path,
			node: this.currentNode,
			selected: this.selected
		})
	}

	extendSelection(path = null) {
		this.moveTo(path)
		if (this.#multiselect) {
			this.#toggleSelection()
		} else {
			this.select()
		}
	}
}
