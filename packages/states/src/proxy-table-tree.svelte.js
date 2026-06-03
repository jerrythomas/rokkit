/**
 * ProxyTableTree
 *
 * Hierarchical analog of ProxyTable. Accepts nested rows (each row may
 * carry a `children: []` array) and exposes the same columns + sortState
 * API as ProxyTable.
 *
 * Sort semantics differ from the flat case: sorting is applied within
 * each parent's children array, so the parent/child structure is
 * preserved. A single top-level sort by 'name' reorders siblings at
 * every depth but never lifts a child out of its parent.
 *
 * Use the `nestByPath` / `nestByColumns` helpers from `@rokkit/data`
 * to convert path-string or column-array flat shapes into the nested
 * shape this class consumes.
 */

import { BASE_FIELDS } from '@rokkit/core'
import { ProxyTable } from './proxy-table.svelte.js'

export class ProxyTableTree extends ProxyTable {
	#childField

	/**
	 * @param {Array<Record<string, unknown>>} [data]  Nested rows.
	 * @param {{ columns?: Array, fields?: object, onsort?: Function }} [options]
	 */
	constructor(data = [], options = {}) {
		super(data, options)
		const fields = options.fields ?? {}
		this.#childField = fields.children ?? BASE_FIELDS.children
	}

	/**
	 * Recursively apply the current sortState to a nested row array.
	 * Sorts siblings within each parent — children stay attached to their
	 * own parent regardless of the sort order chosen.
	 *
	 * @param {Array<Record<string, unknown>>} rows
	 * @returns {Array<Record<string, unknown>>}
	 */
	_sortedData(rows) {
		if (this.sortState.length === 0) return rows
		const sorted = [...rows].sort((a, b) => this._compareRows(a, b))
		const field = this.#childField
		return sorted.map((row) => {
			const children = row[field]
			if (Array.isArray(children) && children.length > 0) {
				return { ...row, [field]: this._sortedData(children) }
			}
			return row
		})
	}
}
