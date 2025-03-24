import { getKeyFromPath } from '@rokkit/core'
import { equals } from 'ramda'
import { ListController } from './list-controller.svelte'
import { getPathFromKey } from '@rokkit/core'

export class NestedController extends ListController {
	constructor(items, value, fields, options) {
		super(items, value, fields, options)
	}

	/**
	 * @protected
	 * @param {Object} [value]
	 */
	init(items, value) {
		this.data = []
		this.createLookup(items)
		if (value) {
			this.ensureVisible(value)
			this.moveToValue(value)
		} else {
			this.refresh(this.items)
		}
	}
	/**
	 * @private
	 * @param {Object[]} items
	 * @param {number[]} [path]=[]
	 */
	createLookup(items, path = []) {
		const depth = path.length
		if (depth >= this.mappers.length) {
			this.mappers.push(this.mappers[depth - 1].getChildMapper())
		}
		const fm = this.mappers[depth]

		items.forEach((item, index) => {
			const itemPath = [...path, index]
			const key = getKeyFromPath(itemPath)

			this.lookup.set(key, item)
			if (fm.get('selected', item)) {
				this.selectedKeys.add(key)
			}

			if (fm.hasChildren(item)) {
				if (fm.get('expanded', item)) {
					this.expandedKeys.add(key)
				}
				this.createLookup(fm.get('children', item), itemPath)
			}
		})
	}

	/**
	 * @private
	 * @param {Object[]} items
	 * @param {number[]} [path]=[]
	 * @param {boolean}  [visible]=true
	 */
	refresh(items, path = [], visible = true) {
		if (path.length === 0) this.data = []
		const fm = this.mappers[path.length]
		items.forEach((item, index) => {
			const itemPath = [...path, index]
			const key = getKeyFromPath(itemPath)
			const expanded = this.expandedKeys.has(key)

			if (visible) this.data.push({ key, value: item })
			if (fm.hasChildren(item)) {
				this.refresh(fm.get('children', item), itemPath, visible && expanded)
			}
		})
	}

	ensureVisible(value) {
		const result = this.lookup.entries().find((entry) => equals(entry[1], value))
		if (!Array.isArray(result)) return false
		const path = getPathFromKey(result[0])

		for (let i = 1; i < path.length; i++) {
			const nodeKey = getKeyFromPath(path.slice(0, i))
			this.expand(nodeKey)
		}
		return true
	}

	toggleExpansion(key) {
		if (!this.lookup.has(key)) return false
		if (this.expandedKeys.has(key)) {
			this.expandedKeys.delete(key)
		} else {
			this.expandedKeys.add(key)
		}

		this.refresh(this.items)
		return true
	}

	expand(key) {
		if (!this.lookup.has(key)) return false
		if (!this.expandedKeys.has(key)) {
			this.expandedKeys.add(key)
			this.refresh(this.items)
		}
	}

	collapse(key) {
		if (!this.lookup.has(key)) return false
		if (this.expandedKeys.has(key)) this.expandedKeys.delete(key)
		this.refresh(this.items)
	}

	hasChildren(key) {
		const path = getPathFromKey(key)
		const fm = this.mappers[path.length - 1]
		return fm.hasChildren(this.lookup.get(key))
	}
}
