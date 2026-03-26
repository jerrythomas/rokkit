/**
 * Shared pipeline execution logic used by both DataSet and ReactiveDataSet.
 *
 * Kept in a plain `.js` file so it can be imported from both regular modules
 * and `.svelte.js` files without triggering rune compilation errors.
 */

import { deriveSortableColumn } from './infer.js'

/**
 * Sort an array in-place by one or more field specs.
 * @param {any[]} data - Array to sort (mutated in place).
 * @param {...string|Object|Array} fields - Sort field specs (same as DataSet.sortBy).
 * @returns {any[]}
 */
export function sortDataByFields(data, ...fields) {
	const sorters = fields.map(deriveSortableColumn)
	data.sort((a, b) => {
		let result = 0
		for (let i = 0; i < sorters.length && result === 0; i++) {
			const { name, sorter } = sorters[i]
			result = sorter(a[name], b[name])
		}
		return result
	})
	return data
}

/**
 * Execute a list of pipeline ops in a single fused pass over `data`.
 *
 * Ops:
 *   { type: 'filter', fn }  — keep rows where fn(row) is truthy
 *   { type: 'map',    fn }  — transform row via fn(row)
 *   { type: 'sort', fields } — sort the result by fields
 *
 * Consecutive filter/map ops are merged into one loop.
 * Sort ops are applied after the linear pass.
 *
 * @param {any[]} data
 * @param {Array<{type:string, fn?:Function, fields?:string[]}>} ops
 * @returns {any[]}
 */
export function executeFused(data, ops) {
	if (ops.length === 0) return data

	let result = data
	let i = 0

	while (i < ops.length) {
		// Collect a run of linear (filter/map) ops
		const linearOps = []
		while (i < ops.length && ops[i].type !== 'sort') {
			linearOps.push(ops[i])
			i++
		}

		if (linearOps.length > 0) {
			const out = []
			for (const row of result) {
				let cur = row
				let keep = true
				for (const op of linearOps) {
					if (op.type === 'filter') {
						if (!op.fn(cur)) {
							keep = false
							break
						}
					} else {
						cur = op.fn(cur)
					}
				}
				if (keep) out.push(cur)
			}
			result = out
		}

		// Collect a run of sort ops and apply them as a single sort
		const sortFields = []
		while (i < ops.length && ops[i].type === 'sort') {
			sortFields.push(...ops[i].fields)
			i++
		}
		if (sortFields.length > 0) {
			result = [...result]
			sortDataByFields(result, ...sortFields)
		}
	}

	return result
}
