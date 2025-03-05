import { FieldMapper } from '@rokkit/core'
import { SvelteSet } from 'svelte/reactivity'

import { flatHierarchy } from './hierarchy'
import { equals } from 'ramda'
import { DEFAULT_EVENTS } from './constants'

export class DataWrapper {
	items = null
	mapping = new FieldMapper()
	data = $state([])
	current = $state(-1)
	selected = new SvelteSet()

	events = DEFAULT_EVENTS

	constructor(items, value, mapping, events) {
		this.items = items
		this.mapping = mapping ?? this.mapping
		this.events = { ...DEFAULT_EVENTS, ...events }

		this.data = flatHierarchy(items, this.mapping)
		this.current = this.data.findIndex((item) => equals(item.item, value))
	}
	#moveTo(index) {
		if (index < 0 || index >= this.data.length || index === this.current) return
		this.current = index
		this.events.move(this.data[this.current].item)
	}
	moveNext() {
		let index = this.current
		do {
			index++
		} while (index < this.data.length && this.mapping.isHidden(this.data[index].item))

		this.#moveTo(index)
	}

	movePrevious() {
		let index = this.current
		do {
			index--
		} while (index > -1 && this.mapping.isHidden(this.data[index].item))
		this.#moveTo(index)
	}

	moveToParent() {
		if (this.current === -1) return
		const item = this.data[this.current].item

		if (item.parent) {
			const index = this.data.findIndex((node) => equals(node.path, item.parent.path))
			this.#moveTo(index)
		}
	}

	moveToChild() {
		if (this.current === -1) return
		const item = this.data[this.current].item

		if (this.mapping.hasChildren(item)) {
			if (!this.mapping.isExpanded(item)) {
				this.mapping.toggleExpansion(item)
			}
			this.moveNext()
		}
	}

	moveLast() {
		let index = this.data.length - 1
		while (index > 0 && this.mapping.isHidden(this.data[index].item)) {
			index--
		}
		this.#moveTo(index)
	}

	moveFirst() {
		let index = 0
		while (index < this.data.length && this.mapping.isHidden(this.data[index].item)) {
			index++
		}
		this.#moveTo(index)
	}

	toggleSelection() {
		if (this.current === -1) return

		const item = this.data[this.current].item

		if (this.selected.has(item)) {
			this.selected.delete(item)
		} else {
			this.selected.add(item)
		}
		this.events.select(item, this.selected)
	}

	toggleExpansion() {
		if (this.current === -1) return

		const item = this.data[this.current].item

		if (this.mapping.hasChildren(item)) {
			this.mapping.toggleExpansion(item)
			if (this.mapping.isExpanded(item)) {
				this.events.expand(item)
			} else {
				this.events.collapse(item)
			}
		}
	}
}
