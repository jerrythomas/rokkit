/**
 * Highlight-selector resolution.
 *
 * One small resolver per selector kind, plus a dispatcher. The kinds share
 * nothing but their signature, so keeping them separate means each can be read
 * and tested on its own instead of as one branch of a 24-complexity chain.
 */

/**
 * Indices where a predicate selector matches.
 * @param {Array<Record<string, unknown>>} rows
 * @param {(row: any, i: number) => boolean} predicate
 * @returns {number[]}
 */
function byPredicate(rows, predicate) {
	const out = []
	for (let i = 0; i < rows.length; i++) if (predicate(rows[i], i)) out.push(i)
	return out
}

/**
 * A single index. Negative values count back from the end (`-1` is the last
 * row); anything out of range resolves to nothing.
 * @param {Array<Record<string, unknown>>} rows
 * @param {number} index
 * @returns {number[]}
 */
function byIndex(rows, index) {
	const i = index < 0 ? rows.length + index : index
	return i >= 0 && i < rows.length ? [i] : []
}

/**
 * The index of the row whose numeric `y` is smallest (`min`) or largest (`max`).
 *
 * Non-numeric values are dropped rather than compared — `NaN` loses every
 * comparison, so leaving them in would make the result depend on iteration
 * order. Ties keep the earliest row. Candidates are collected before reducing
 * so an all-`Infinity` column still resolves to its first row, which a
 * strict-improvement scan seeded with `Infinity` would reject.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {string | undefined} y
 * @param {'min'|'max'} kind
 * @returns {number[]}
 */
function byExtreme(rows, y, kind) {
	if (!y) return []
	// Searching for the smallest `sign * value` finds the max when sign is -1,
	// which collapses two mirror-image scans into one.
	const sign = kind === 'min' ? 1 : -1
	const candidates = rows
		.map((row, i) => ({ i, value: sign * Number(row[y]) }))
		.filter(({ value }) => !Number.isNaN(value))
	if (candidates.length === 0) return []
	return [candidates.reduce((best, c) => (c.value < best.value ? c : best)).i]
}

/**
 * Named selectors, all sharing one signature so the dispatcher can call any of
 * them uniformly. `rows` is guaranteed non-empty by the time these run.
 * @type {Record<string, (rows: Array<Record<string, unknown>>, y?: string) => number[]>}
 */
const NAMED = {
	first: () => [0],
	last: (rows) => [rows.length - 1],
	min: (rows, y) => byExtreme(rows, y, 'min'),
	max: (rows, y) => byExtreme(rows, y, 'max')
}

/**
 * True when the inputs cannot resolve to any row, whatever the selector means.
 * @param {unknown} rows
 * @param {unknown} selector
 */
const isUnresolvable = (rows, selector) =>
	!Array.isArray(rows) || rows.length === 0 || selector === null || selector === undefined

/**
 * Resolve a highlight selector to zero or more row indices.
 * @param {Array<Record<string, unknown>>} rows
 * @param {'first'|'last'|'min'|'max'|number|((row:any,i:number)=>boolean)} selector
 * @param {{ y?: string }} [opts]
 * @returns {number[]}
 */
export function resolveHighlight(rows, selector, opts = {}) {
	if (isUnresolvable(rows, selector)) return []
	if (typeof selector === 'function') return byPredicate(rows, selector)
	if (typeof selector === 'number') return byIndex(rows, selector)
	// hasOwn, not a bare lookup: `NAMED['constructor']` would otherwise resolve to
	// Object's constructor and get called. Same guard as PATTERNS in SparkState.
	const named = Object.hasOwn(NAMED, selector) ? NAMED[selector] : null
	return named ? named(rows, opts.y) : []
}
