/**
 * ProxyTable
 *
 * Tabular analog of ProxyTree. Owns flat row data plus column metadata and
 * sort state. Composes ProxyTree's reactive data layer (flatView + lookup)
 * so a plain Wrapper can navigate over a ProxyTable without modification.
 *
 * Splits cleanly into:
 *   ProxyTree — owns rows-as-proxies + flatView + lookup
 *   ProxyTable adds columns + sortState + sortBy/clearSort/update
 *   Wrapper navigates over either
 *
 * Sort semantics:
 *   - sortBy(name)        single-column sort (clears any prior sort)
 *   - sortBy(name, true)  multi-column sort (extends the sort stack;
 *                         repeat with same name to cycle the direction;
 *                         direction 'none' removes that column from the stack)
 *   - Three-state cycle per column: none → ascending → descending → none
 *   - clearSort()         resets to original data order
 */

import { ascending, descending } from 'd3-array'
import { deriveColumns } from '@rokkit/data'
import { ProxyTree } from './proxy-tree.svelte.js'

// ─── ProxyTable ───────────────────────────────────────────────────────────────

export class ProxyTable extends ProxyTree {
	columns = $state([])
	sortState = $state([])

	#rawData
	#onsort

	/**
	 * @param {Array<Record<string, unknown>>} [data]
	 * @param {{ columns?: Array, fields?: object, onsort?: Function }} [options]
	 */
	constructor(data = [], options = {}) {
		super(data, options.fields)
		this.#rawData = data
		this.#onsort = options.onsort
		this.columns = options.columns?.length
			? options.columns.map((c) => ({ sortable: true, sorted: 'none', ...c }))
			: deriveColumns(data)
	}

	// ─── Updates ─────────────────────────────────────────────────────────────

	/**
	 * Replace underlying data. Re-applies any active sort so the visible
	 * rows stay in their sorted order.
	 * @param {Array<Record<string, unknown>>} data
	 */
	update(data) {
		this.#rawData = data
		if (this.sortState.length === 0) {
			this.replace(data)
		} else {
			this.replace(this.#sortedData())
		}
	}

	/**
	 * Replace column definitions. Preserves any existing sort indicators
	 * for columns that survive the rename.
	 * @param {Array} columns
	 */
	updateColumns(columns) {
		const prior = Object.fromEntries(this.columns.map((c) => [c.name, c.sorted ?? 'none']))
		this.columns = columns.map((c) => ({
			sortable: true,
			sorted: prior[c.name] ?? 'none',
			...c
		}))
	}

	// ─── Sort API ────────────────────────────────────────────────────────────

	/**
	 * Toggle sort on a column. Direction cycle: none → ascending → descending → none.
	 * Pass `extend=true` (Shift+click) to push onto the multi-column stack.
	 * Fires the `onsort` callback after applying.
	 *
	 * @param {string} columnName
	 * @param {boolean} [extend]
	 */
	sortBy(columnName, extend = false) {
		const col = this.columns.find((c) => c.name === columnName)
		if (!col || col.sortable === false) return
		const nextDirection = this.#nextSortDirection(col)
		this.sortState = extend
			? this.#extendSortState(columnName, nextDirection)
			: this.#singleSortState(columnName, nextDirection)
		this.#syncColumnFlags()
		this.replace(this.#sortedData())
		this.#onsort?.(this.sortState)
	}

	/** Clear all sort state and restore the original data order. */
	clearSort() {
		this.sortState = []
		this.columns = this.columns.map((c) => ({ ...c, sorted: 'none' }))
		this.replace(this.#rawData)
		this.#onsort?.(this.sortState)
	}

	// ─── Sort internals ──────────────────────────────────────────────────────

	#nextSortDirection(col) {
		const cycle = { none: 'ascending', ascending: 'descending', descending: 'none' }
		return cycle[col.sorted ?? 'none']
	}

	#singleSortState(columnName, nextDirection) {
		return nextDirection === 'none' ? [] : [{ column: columnName, direction: nextDirection }]
	}

	#extendSortState(columnName, nextDirection) {
		const existing = this.sortState.findIndex((s) => s.column === columnName)
		if (nextDirection === 'none') {
			return this.sortState.filter((s) => s.column !== columnName)
		}
		if (existing >= 0) {
			return this.sortState.map((s) =>
				s.column === columnName ? { ...s, direction: nextDirection } : s
			)
		}
		return [...this.sortState, { column: columnName, direction: nextDirection }]
	}

	#syncColumnFlags() {
		this.columns = this.columns.map((c) => {
			const sort = this.sortState.find((s) => s.column === c.name)
			return { ...c, sorted: sort ? sort.direction : 'none' }
		})
	}

	#sortedData() {
		if (this.sortState.length === 0) return this.#rawData
		return [...this.#rawData].sort((a, b) => {
			for (const { column, direction } of this.sortState) {
				const cmp = direction === 'ascending' ? ascending : descending
				const result = cmp(a[column], b[column])
				if (result !== 0) return result
			}
			return 0
		})
	}
}
