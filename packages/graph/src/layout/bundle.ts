/* Hierarchical edge bundling — Holten (2006).
 *
 * A radial dendrogram of a codebase has every module on one rim, and the calls between them
 * are chords across the middle. Drawn straight, a few hundred of those are a solid disc of
 * ink. Bundled, edges that travel the same way through the TREE are pulled together, and the
 * picture turns into visible flows between parts of the structure — which is the thing the
 * reader came for.
 *
 * The bundle is a B-spline through the path each edge takes up to the lowest common ancestor
 * and back down, relaxed toward the straight line by `beta`. At `beta = 0` it IS the straight
 * line, which is why that is the "Straight" setting rather than a separate code path.
 */

export type Point = { x: number; y: number }

/**
 * Where two paths stop agreeing.
 *
 * The tree's lowest common ancestor, by prefix — `TreeNode.path` is the full chain from the
 * root, so no parent pointers are needed and nothing has to be walked twice.
 */
export function commonDepth(a: string[], b: string[]): number {
	let i = 0
	while (i < a.length && i < b.length && a[i] === b[i]) i++

	return i
}

/**
 * Pull each control point toward the straight line between the endpoints.
 *
 * `beta` is the tension: 1 keeps the full route through the tree, 0 collapses it onto the
 * chord. Endpoints are unmoved at any beta — an edge has to start and finish where its nodes
 * are, whatever the middle does.
 */
export function relax(points: Point[], beta: number): Point[] {
	if (points.length < 2) return points

	const first = points[0]
	const last = points[points.length - 1]
	const span = points.length - 1

	return points.map((p, i) => {
		const t = i / span
		const straightX = first.x + (last.x - first.x) * t
		const straightY = first.y + (last.y - first.y) * t

		return {
			x: beta * p.x + (1 - beta) * straightX,
			y: beta * p.y + (1 - beta) * straightY
		}
	})
}

const fmt = (n: number) => Number(n.toFixed(2))

/**
 * A uniform cubic B-spline through `points`, as an SVG path.
 *
 * B-spline rather than a curve THROUGH the points: a spline that interpolates every control
 * point reproduces the corner at each tree level, and the whole reason to route through the
 * tree is to get a smooth flow. The ends are duplicated so the curve actually reaches the
 * first and last point instead of stopping short of them.
 */
export function splinePath(points: Point[]): string {
	if (points.length === 0) return ''
	if (points.length === 1) return `M ${fmt(points[0].x)} ${fmt(points[0].y)}`
	if (points.length === 2) {
		return `M ${fmt(points[0].x)} ${fmt(points[0].y)} L ${fmt(points[1].x)} ${fmt(points[1].y)}`
	}

	// Clamped: repeating the endpoints pins the curve to them, which a plain B-spline does not do.
	const p = [points[0], points[0], ...points, points[points.length - 1], points[points.length - 1]]
	let d = `M ${fmt(p[1].x)} ${fmt(p[1].y)}`

	for (let i = 1; i < p.length - 2; i++) {
		const [a, b, c, e] = [p[i - 1], p[i], p[i + 1], p[i + 2]]
		// Standard uniform cubic B-spline in Bezier form.
		const c1 = { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 }
		const c2 = { x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6 }
		d += ` C ${fmt(c1.x)} ${fmt(c1.y)}, ${fmt(c2.x)} ${fmt(c2.y)}, ${fmt(c.x)} ${fmt(c.y)}`
	}

	return d
}

/** The bundled route between two leaves, relaxed by `beta` and drawn as a spline. */
export function bundlePath(points: Point[], beta: number): string {
	return splinePath(relax(points, beta))
}
