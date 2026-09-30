/**
 * Convex hull (Andrew's monotone chain), O(n log n), and its SVG path.
 *
 * Hand-rolled rather than `d3-polygon` because the degenerate cases matter here and d3 returns
 * null for them: a group with one or two members is still a group, and an outline that
 * silently disappears for a small package is the same lie as an edge that disappears for an
 * unresolved call.
 */

/** @typedef {[number, number]} Pt */

/** z of (b - a) × (c - a): > 0 is a left (counter-clockwise) turn. */
const cross = (/** @type {Pt} */ a, /** @type {Pt} */ b, /** @type {Pt} */ c) =>
	(b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

/**
 * Hull vertices, counter-clockwise in a y-up frame, starting from the lowest-x point.
 * Collinear edge points are dropped; duplicates collapse; one or two distinct points come
 * back as-is (a dot, a segment).
 *
 * @param {Pt[]} points
 * @returns {Pt[]}
 */
export function convexHull(points) {
	const seen = new Set()
	const pts = []
	for (const p of points) {
		const key = `${p[0]},${p[1]}`
		if (!seen.has(key)) {
			seen.add(key)
			pts.push(p)
		}
	}
	pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
	if (pts.length < 3) return pts

	/** @param {Pt[]} seq */
	const chain = (seq) => {
		/** @type {Pt[]} */
		const out = []
		for (const p of seq) {
			while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop()
			out.push(p)
		}
		out.pop()
		return out
	}
	const hull = [...chain(pts), ...chain([...pts].reverse())]
	// All points collinear: both chains collapse to the two extremes.
	return hull.length < 2 ? [pts[0], pts[pts.length - 1]] : hull
}

/**
 * Closed SVG path through hull vertices. One vertex is a zero-length subpath and two are a
 * segment — with a round cap and a wide stroke those render as a dot and a capsule, which is
 * how `Hull` pads every group, whatever its size, with one element.
 *
 * @param {Pt[]} hull
 */
export function hullPath(hull) {
	if (hull.length === 0) return ''
	const fmt = (/** @type {number} */ n) => Math.round(n * 1000) / 1000
	return `M${hull.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join('L')}Z`
}
