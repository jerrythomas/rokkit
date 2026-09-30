/**
 * The segment of `y = slope·x + intercept` that lies inside a rectangular domain, or null
 * when the line misses it.
 *
 * Clipping in DATA space, not pixels, is what keeps a reference line honest under zoom: the
 * scales' domains are already the visible window, so the same call is correct at any zoom.
 * A line that merely touches a corner returns a zero-length segment rather than null — it is
 * inside the domain, just barely.
 *
 * @param {number} slope
 * @param {number} intercept
 * @param {[number, number]} xDomain
 * @param {[number, number]} yDomain
 * @returns {{ x1: number, y1: number, x2: number, y2: number } | null}
 */
export function clipAbline(slope, intercept, xDomain, yDomain) {
	const [x0, x1] = [Math.min(...xDomain), Math.max(...xDomain)]
	const [y0, y1] = [Math.min(...yDomain), Math.max(...yDomain)]
	const at = (x) => slope * x + intercept

	if (slope === 0) {
		return intercept < y0 || intercept > y1
			? null
			: { x1: x0, y1: intercept, x2: x1, y2: intercept }
	}

	// Where the line crosses the lower and upper y bounds, ordered along x.
	const xAtY0 = (y0 - intercept) / slope
	const xAtY1 = (y1 - intercept) / slope
	const lo = Math.max(x0, Math.min(xAtY0, xAtY1))
	const hi = Math.min(x1, Math.max(xAtY0, xAtY1))
	if (lo > hi) return null
	return { x1: lo, y1: at(lo), x2: hi, y2: at(hi) }
}

/**
 * Where a sloped line's label goes: its midpoint, rotated to run along it.
 *
 * Not the end, where an axis-aligned rule puts its label — a sloped line's ends are corners
 * of the plot, exactly where points and axis ticks crowd. The angle is folded into
 * (-90°, 90°] so the text never reads upside down, whichever way the line was drawn.
 *
 * @param {{ x1: number, y1: number, x2: number, y2: number }} seg  screen coordinates
 * @returns {{ x: number, y: number, angle: number }}
 */
export function slopeLabel({ x1, y1, x2, y2 }) {
	let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
	if (angle > 90) angle -= 180
	if (angle <= -90) angle += 180
	return { x: (x1 + x2) / 2, y: (y1 + y2) / 2, angle }
}
