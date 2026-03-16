import { ascending, descending } from 'd3-array'
import { deriveColumns } from '@rokkit/data'
import { ListController } from './list-controller.svelte.js'

/**
 * TableController — manages table state via composition over ListController.
 *
 * Handles column metadata, sorting (single and multi-column), and delegates
 * row focus/selection/navigation to an internal ListController.
 */
export class TableController {
	columns = $state([])
	sortState = $state([])

	#list
	#rawData
	#fields

	/**
	 * @param {Array<Record<string, unknown>>} data - Row data
	 * @param {Object} [options]
	 * @param {Array} [options.columns] - Column definitions (auto-derived if empty)
	 * @param {Object} [options.fields] - Row-level field mapping
	 * @param {*} [options.value] - Initial selected value
	 * @param {boolean} [options.multiselect] - Enable multi-row selection
	 */
	constructor(data = [], options = {}) {
		const { columns, fields, value, multiselect } = options
		this.#rawData = data
		this.#fields = fields
		this.columns = columns?.length
			? columns.map((c) => ({ sortable: true, sorted: 'none', ...c }))
			: deriveColumns(data)
		this.#list = new ListController(data, value, fields, { multiselect })
	}

	// =========================================================================
	// Sort
	// =========================================================================

	/**
	 * Compute the next sort state for multi-column (extend) mode.
	 * @param {string} columnName
	 * @param {string} nextDirection
	 * @returns {Array}
	 */
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

	/**
	 * Compute new sort state for a single-column sort.
	 * @param {string} columnName
	 * @param {string} nextDirection
	 * @returns {Array}
	 */
	#singleSortState(columnName, nextDirection) {
		return nextDirection === 'none' ? [] : [{ column: columnName, direction: nextDirection }]
	}

	/**
	 * Sync column sorted flags from current sortState.
	 */
	#syncColumnFlags() {
		this.columns = this.columns.map((c) => {
			const sort = this.sortState.find((s) => s.column === c.name)
			return { ...c, sorted: sort ? sort.direction : 'none' }
		})
	}

	/**
	 * Determine the next sort direction for a column by cycling.
	 * @param {object} col  Column object with sorted property
	 * @returns {string}
	 */
	#nextSortDirection(col) {
		const cycle = { none: 'ascending', ascending: 'descending', descending: 'none' }
		return cycle[col.sorted ?? 'none']
	}

	/**
	 * Toggle sort on a column. Cycles: none → ascending → descending → none.
	 * @param {string} columnName - Column to sort by
	 * @param {boolean} [extend=false] - If true (Shift+click), add to sort stack
	 */
	sortBy(columnName, extend = false) {
		const col = this.columns.find((c) => c.name === columnName)
		if (!col || col.sortable === false) return
		const nextDirection = this.#nextSortDirection(col)
		this.sortState = extend
			? this.#extendSortState(columnName, nextDirection)
			: this.#singleSortState(columnName, nextDirection)
		this.#syncColumnFlags()
		this.#applySortAndUpdate()
	}

	/**
	 * Clear all sort state and restore original data order.
	 */
	clearSort() {
		this.sortState = []
		this.columns = this.columns.map((c) => ({ ...c, sorted: 'none' }))
		this.#list.update(this.#rawData)
	}

	/**
	 * Apply current sortState to rawData and feed sorted data to list controller.
	 * @private
	 */
	#applySortAndUpdate() {
		if (this.sortState.length === 0) {
			this.#list.update(this.#rawData)
			return
		}

		const sorted = [...this.#rawData].sort((a, b) => {
			for (const { column, direction } of this.sortState) {
				const comparator = direction === 'ascending' ? ascending : descending
				const result = comparator(a[column], b[column])
				if (result !== 0) return result
			}
			return 0
		})

		this.#list.update(sorted)
	}

	// =========================================================================
	// Data access (delegated to ListController)
	// =========================================================================

	get data() {
		return this.#list.data
	}

	get lookup() {
		return this.#list.lookup
	}

	get focusedKey() {
		return this.#list.focusedKey
	}

	set focusedKey(v) {
		this.#list.focusedKey = v
	}

	get focused() {
		return this.#list.focused
	}

	get selected() {
		return this.#list.selected
	}

	get selectedKeys() {
		return this.#list.selectedKeys
	}

	// =========================================================================
	// Navigation (delegated to ListController)
	// =========================================================================

	moveFirst() {
		return this.#list.moveFirst()
	}

	moveLast() {
		return this.#list.moveLast()
	}

	moveNext() {
		return this.#list.moveNext()
	}

	movePrev() {
		return this.#list.movePrev()
	}

	moveTo(path) {
		return this.#list.moveTo(path)
	}

	moveToIndex(index) {
		return this.#list.moveToIndex(index)
	}

	// =========================================================================
	// Selection (delegated to ListController)
	// =========================================================================

	select(key) {
		return this.#list.select(key)
	}

	extendSelection(key) {
		return this.#list.extendSelection(key)
	}

	// =========================================================================
	// Update
	// =========================================================================

	/**
	 * Update the data source. Re-applies current sort if active.
	 * @param {Array<Record<string, unknown>>} data
	 */
	update(data) {
		this.#rawData = data
		this.#applySortAndUpdate()
	}
}
