/**
 * Map a value through a d3 scale to its plotted position, centering on band
 * scales (adds `bandwidth/2`). Returns `NaN` when the scale yields `undefined`
 * (value outside the domain) so overlay callers can drop the point via
 * `Number.isFinite`.
 * @param {(v: unknown) => number | undefined} scale
 * @param {unknown} v
 * @returns {number}
 */
export function scalePos(scale, v) {
	const p = scale(v)
	if (p === undefined) return NaN
	return typeof scale.bandwidth === 'function' ? p + scale.bandwidth() / 2 : p
}
