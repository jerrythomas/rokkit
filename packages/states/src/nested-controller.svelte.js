import { getKeyFromPath, getPathFromKey } from '@rokkit/core'
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
			this.expandedKeys.add(nodeKey)
		}
		return true
	}

	/**
	 * Toggle expansion of item
	 * @param {string} key
	 * @returns {boolean}
	 */
	toggleExpansion(key) {
		if (!this.lookup.has(key)) return false
		if (this.expandedKeys.has(key)) {
			this.expandedKeys.delete(key)
		} else {
			this.expandedKeys.add(key)
		}
		return true
	}

	/**
	 * Expand item
	 * @param {string} [key]
	 * @returns {boolean}
	 */
	expand(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false
		this.expandedKeys.add(actualKey)
		return true
	}

	/**
	 * Collapse item
	 * @param {string} [key]
	 * @returns {boolean}
	 */
	collapse(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false
		this.expandedKeys.delete(actualKey)
		return true
	}
}
