/**
 * Resolve a highlight selector to zero or more row indices.
 * @param {Array<Record<string, unknown>>} rows
 * @param {'first'|'last'|'min'|'max'|number|((row:any,i:number)=>boolean)} selector
 * @param {{ y?: string }} [opts]
 * @returns {number[]}
 */
export function resolveHighlight(rows, selector, opts = {}) {
	if (!Array.isArray(rows) || rows.length === 0 || selector === null || selector === undefined)
		return []
	const { y } = opts

	if (typeof selector === 'function') {
		const out = []
		for (let i = 0; i < rows.length; i++) if (selector(rows[i], i)) out.push(i)
		return out
	}

	if (typeof selector === 'number') {
		const i = selector < 0 ? rows.length + selector : selector
		return i >= 0 && i < rows.length ? [i] : []
	}

	if (selector === 'first') return [0]
	if (selector === 'last') return [rows.length - 1]

	if (selector === 'min' || selector === 'max') {
		if (!y) return []
		let best = -1
		let bestVal = null
		for (let i = 0; i < rows.length; i++) {
			const v = Number(rows[i][y])
			if (Number.isNaN(v)) continue
			if (bestVal === null || (selector === 'min' ? v < bestVal : v > bestVal)) {
				bestVal = v
				best = i
			}
		}
		return best === -1 ? [] : [best]
	}

	return []
}
