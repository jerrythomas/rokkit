/**
 * Region geometry — data-coordinate shapes resolved to plot (u, v) coordinates.
 *
 * Kept out of the component so the maths is testable without a DOM, and so every geom that
 * needs "a shape in data space" (Region today, anything shaded tomorrow) resolves it the same
 * way: continuous values map straight through the scale, band categories cover the WHOLE
 * band, and an omitted range spans the axis.
 */

/** @typedef {{ (v: unknown): number | undefined, bandwidth?: () => number, range: () => number[], domain: () => unknown[] }} AnyScale */

/** @param {AnyScale} scale */
const isBand = (scale) => typeof scale.bandwidth === 'function'

/**
 * The data value an open (null/undefined) range end stands for: the low or high end of the
 * axis's domain — the first or last category on a band axis.
 *
 * @param {AnyScale} scale
 * @param {unknown} v
 * @param {'lo' | 'hi'} side
 */
function endValue(scale, v, side) {
	if (v !== null && v !== undefined) return v
	const domain = /** @type {{ domain: () => unknown[] }} */ (/** @type {unknown} */ (scale)).domain()
	if (isBand(scale)) return side === 'lo' ? domain[0] : domain[domain.length - 1]
	const nums = domain.map(Number)
	return side === 'lo' ? Math.min(...nums) : Math.max(...nums)
}

/**
 * Screen span of a [lo, hi] range on one axis. A band category contributes its whole band,
 * so `x={['a', 'b']}` shades both columns edge to edge. Omitted → the full range; a `null`
 * end runs to that edge of the axis, so `[p75, null]` is "the top quartile and beyond".
 *
 * @param {AnyScale} scale
 * @param {unknown[] | undefined} range
 * @returns {[number, number]}
 */
export function spanOf(scale, range) {
	if (!range || range.length < 2) {
		const r = scale.range()
		return [Math.min(...r), Math.max(...r)]
	}
	const band = isBand(scale) ? /** @type {() => number} */ (scale.bandwidth)() : 0
	const ends = [endValue(scale, range[0], 'lo'), endValue(scale, range[1], 'hi')].map((v) => Number(scale(v)))
	return [Math.min(...ends), Math.max(...ends) + band]
}

/**
 * Position of a single data value — band categories resolve to the band centre, which is
 * where a point in that category is drawn.
 *
 * @param {AnyScale} scale
 * @param {unknown} v
 */
export function positionOf(scale, v) {
	const base = Number(scale(v))
	return isBand(scale) ? base + /** @type {() => number} */ (scale.bandwidth)() / 2 : base
}

/**
 * The region's vertices in (u, v) plot coordinates — before orientation `place`.
 *
 * `points` (a polygon, three or more vertices) wins over `x`/`y` ranges. Fewer than three
 * points is not an area, so it resolves to nothing rather than a degenerate sliver.
 *
 * @param {{ x?: unknown[], y?: unknown[], points?: unknown[][] }} shape
 * @param {AnyScale} xScale
 * @param {AnyScale} yScale
 * @returns {Array<[number, number]>}
 */
export function regionVertices(shape, xScale, yScale) {
	if (shape.points) {
		if (shape.points.length < 3) return []
		return shape.points.map(([x, y]) => [positionOf(xScale, x), positionOf(yScale, y)])
	}
	if (!shape.x && !shape.y) return []
	const [x0, x1] = spanOf(xScale, shape.x)
	const [y0, y1] = spanOf(yScale, shape.y)
	// Wound so the first vertex is the (lo-x, lo-y) corner in DATA terms: on a vertical chart
	// the y range is inverted, so y1 (the larger pixel) is the lower value.
	return [
		[x0, y1],
		[x1, y1],
		[x1, y0],
		[x0, y0]
	]
}

/**
 * Area centroid of a simple polygon — where its label goes. Falls back to the vertex mean for
 * a zero-area (collinear) polygon, which has no area centroid.
 *
 * @param {Array<{ x: number, y: number }>} pts
 * @returns {{ x: number, y: number }}
 */
export function centroid(pts) {
	let a = 0
	let cx = 0
	let cy = 0
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i]
		const q = pts[(i + 1) % pts.length]
		const cross = p.x * q.y - q.x * p.y
		a += cross
		cx += (p.x + q.x) * cross
		cy += (p.y + q.y) * cross
	}
	if (Math.abs(a) < 1e-9) {
		const n = pts.length || 1
		return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n }
	}
	return { x: cx / (3 * a), y: cy / (3 * a) }
}

/**
 * SVG path data for a closed polygon.
 *
 * @param {Array<{ x: number, y: number }>} pts
 */
export function polygonPath(pts) {
	const fmt = (/** @type {number} */ n) => Math.round(n * 1000) / 1000
	return `M${pts.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join(' L')} Z`
}
