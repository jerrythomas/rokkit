import { getKeyFromPath, getPathFromKey, getNestedFields } from '@rokkit/core'
import { equals } from 'ramda'
import { ListController } from './list-controller.svelte'

export class NestedController extends ListController {
	constructor(items, value, fields, options) {
		super(items, value, fields, options)
	}

	/**
	 * @protected
	 * @param {Object} [value]
	 */
	init(items, value) {
		this.createLookup(items)
		if (value) {
			this.ensureVisible(value)
			this.moveToValue(value)
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
				this.createLookup(fm.get('children', item), itemPath)
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
		const item = this.lookup.get(key)
		const fields = this.fieldsFor(key)
		item[fields.expanded] = !item[this.fields.expanded]
		return true
	}

	expand(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false
		const item = this.lookup.get(actualKey)
		const fields = this.fieldsFor(actualKey)
		item[fields.expanded] = true

		return true
	}

	collapse(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false
		const item = this.lookup.get(actualKey)
		const fields = this.fieldsFor(actualKey)
		item[fields.expanded] = false
		return true
	}

	/**
	 *
	 * @param {*} key
	 * @returns
	 */
	fieldsFor(key) {
		const path = getPathFromKey(key)
		let fields = this.fields
		for (let i = 1; i < path.length; i++) {
			fields = getNestedFields(fields)
		}
		return fields
	}
}
