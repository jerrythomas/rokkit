/**
 * ReactiveDataSet — Svelte 5 rune-based reactive wrapper for dataset operations.
 *
 * Use this in Svelte 5 components when you need the pipeline to auto-recompute
 * when source data changes (e.g. live search, CRUD lists).
 *
 * Unlike `DataSet`, which is imperatively pipeline-driven, `ReactiveDataSet` holds
 * reactive configuration ($state) and exposes a `rows` getter backed by $derived —
 * so templates can bind to `ds.rows` directly without calling `.select()`.
 *
 * File must remain `.svelte.js` for Svelte 5 rune compilation.
 */

import { executeFused } from './pipeline.js'
import { deriveColumnDefs } from './infer.js'

export class ReactiveDataSet {
	/** @type {any[]} */
	#source = $state([])

	/** @type {Function|null} */
	#filter = $state(null)

	/** @type {Array<{fn: Function}>} */
	#transforms = $state([])

	/** @type {string[]} */
	#sortFields = $state([])

	/** @type {Array<Object>} Per-column overrides merged into auto-derived column defs. */
	#columnEnhancements = $state([])

	/** @type {Object} Options forwarded to deriveColumnDefs (language, scanMode, etc.) */
	#columnOptions = $state({})

	/**
	 * @param {any[]} data - Initial source rows.
	 */
	constructor(data = []) {
		this.#source = data
	}

	/**
	 * Reactive computed result of filter + transforms + sort.
	 * Bind to this in templates instead of calling `.select()`.
	 */
	get rows() {
		const ops = []
		if (this.#filter) ops.push({ type: 'filter', fn: this.#filter })
		for (const t of this.#transforms) ops.push({ type: 'map', fn: t.fn })
		if (this.#sortFields.length > 0) ops.push({ type: 'sort', fields: this.#sortFields })
		return executeFused(this.#source, ops)
	}

	/**
	 * Reactive derived column definitions: name, type, scale (discrete|continuous),
	 * sortable, filterable, fields, formatter — merged with any `withColumns` overrides.
	 *
	 * Re-computes when source data or column enhancements change.
	 * Bind to this in templates for Table / TreeTable column specs.
	 */
	get columns() {
		return deriveColumnDefs(this.#source, {
			...this.#columnOptions,
			enhancements: this.#columnEnhancements
		})
	}

	// ── Configuration (chainable) ────────────────────────────────────────────

	/**
	 * Set the filter predicate. Replaces any previous filter.
	 * @param {Function|null} fn
	 */
	where(fn) {
		this.#filter = fn
		return this
	}

	/**
	 * Append a row transform. Each call to `apply` adds a new stage.
	 * @param {Function} fn
	 */
	apply(fn) {
		this.#transforms = [...this.#transforms, { fn }]
		return this
	}

	/**
	 * Set sort fields. Replaces any previous sort.
	 * @param {...string} fields
	 */
	sortBy(...fields) {
		this.#sortFields = fields
		return this
	}

	/**
	 * Set per-column enhancements / overrides for the reactive `columns` property.
	 *
	 * Each entry is matched by `name` and merged into the auto-derived column def.
	 * Unknown names are appended as synthetic columns (useful for action columns).
	 *
	 * @param {Array<Object>} enhancements - e.g. [{ name: 'revenue', label: 'Revenue ($)', scale: 'continuous' }]
	 * @param {Object} [options] - Options forwarded to deriveColumnDefs (language, scanMode).
	 */
	withColumns(enhancements, options = {}) {
		this.#columnEnhancements = enhancements
		this.#columnOptions = options
		return this
	}

	/** Clear the current filter. */
	clearFilter() {
		this.#filter = null
		return this
	}

	/** Clear all transforms. */
	clearTransforms() {
		this.#transforms = []
		return this
	}

	// ── Data mutation ────────────────────────────────────────────────────────

	/**
	 * Replace the entire source dataset.
	 * @param {any[]} rows
	 */
	setData(rows) {
		this.#source = rows
		return this
	}

	/**
	 * Append a single row to the source.
	 * @param {any} row
	 */
	push(row) {
		this.#source = [...this.#source, row]
		return this
	}

	/**
	 * Remove rows matching the predicate from the source.
	 * @param {Function} predicate
	 */
	remove(predicate) {
		this.#source = this.#source.filter((r) => !predicate(r))
		return this
	}

	/**
	 * Update rows matching the predicate with patch (object or function).
	 * @param {Function} predicate
	 * @param {Object|Function} patch
	 */
	update(predicate, patch) {
		this.#source = this.#source.map((row) => {
			if (!predicate(row)) return row
			return typeof patch === 'function' ? patch(row) : { ...row, ...patch }
		})
		return this
	}

	/** Return a plain snapshot of the current reactive result (non-reactive copy). */
	snapshot() {
		return [...this.rows]
	}
}

/**
 * Factory function for `ReactiveDataSet`.
 *
 * @param {any[]} [data=[]] - Initial source rows.
 * @returns {ReactiveDataSet}
 */
export function reactiveDataset(data = []) {
	return new ReactiveDataSet(data)
}
