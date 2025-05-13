import { getKeyFromPath, getPathFromKey, getNestedFields } from '@rokkit/core'
import { equals } from 'ramda'
import { ListController } from './list-controller.svelte'

export class NestedController extends ListController {
	/**
	 * @protected
	 * @param {Object} [value]
	 */
	init(value) {
		if (value) {
			this.ensureVisible(value)
			this.moveToValue(value)
		}
	}

	/**
	 * Mark parents as expanded so that item is visible
	 * @param {*} value
	 * @returns
	 */
	ensureVisible(value) {
		const result = this.lookup.entries().find((entry) => equals(entry[1].value, value))
		const path = getPathFromKey(result[0])

		for (let i = 1; i < path.length; i++) {
			const nodeKey = getKeyFromPath(path.slice(0, i))
			this.expand(nodeKey)
		}
		return true
	}

	/**
	 * Toggle expansion of item
	 * @param {*} value
	 * @returns
	 */
	toggleExpansion(key) {
		if (!this.lookup.has(key)) return false
		const proxy = this.lookup.get(key)
		proxy.expanded = !proxy.expanded
		return true
	}

	/**
	 * Expand item
	 * @param {*} value
	 * @returns
	 */
	expand(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false
		const proxy = this.lookup.get(actualKey)
		proxy.expanded = true

		return true
	}

	/**
	 * Collapse item
	 * @param {*} value
	 * @returns
	 */
	collapse(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false
		const proxy = this.lookup.get(actualKey)
		proxy.expanded = false
		return true
	}
}
