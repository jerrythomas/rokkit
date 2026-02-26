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
		if (!result) return false
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
	 * Expand item. If already expanded, move focus to first child.
	 * @param {string} [key]
	 * @returns {boolean}
	 */
	expand(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false

		const firstChildKey = `${actualKey}-0`
		const hasChildren = this.lookup.has(firstChildKey)

		if (!hasChildren) return false

		if (this.expandedKeys.has(actualKey)) {
			// Already expanded → move to first child
			return this.moveTo(firstChildKey)
		}

		this.expandedKeys.add(actualKey)
		return true
	}

	/**
	 * Collapse item. If not expandable (leaf or already collapsed), move focus to parent.
	 * @param {string} [key]
	 * @returns {boolean}
	 */
	collapse(key) {
		const actualKey = key ?? this.focusedKey
		if (!this.lookup.has(actualKey)) return false

		if (this.expandedKeys.has(actualKey)) {
			this.expandedKeys.delete(actualKey)
			return true
		}

		// Leaf or collapsed group → move to parent
		const path = getPathFromKey(actualKey)
		if (path.length > 1) {
			const parentKey = getKeyFromPath(path.slice(0, -1))
			return this.lookup.has(parentKey) ? this.moveTo(parentKey) : false
		}
		return false
	}
}
