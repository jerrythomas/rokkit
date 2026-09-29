/* An annulus sector as an SVG path.
 *
 * Kept out of the component because it is arithmetic, not rendering: the layout reports a
 * wedge as four numbers, and turning those into a path is a pure function that can be tested
 * to exact coordinates. The same split `edgePath` already makes.
 */

export type Wedge = { r0: number; r1: number; a0: number; a1: number }

const TAU = Math.PI * 2

/** Point on a circle of radius `r` at angle `a`, relative to a centre at the origin. */
function at(cx: number, cy: number, r: number, a: number): [number, number] {
	return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
}

const fmt = (n: number) => Number(n.toFixed(3))

/**
 * A full turn cannot be one arc.
 *
 * SVG's `A` command draws the arc BETWEEN two points, and for a complete circle those two
 * points coincide — so the command is a no-op and the wedge vanishes. A single child covering
 * its parent's whole span is the common case at the root, not an edge case, so the span is
 * halved and drawn as two arcs.
 */
function isFullTurn(wedge: Wedge): boolean {
	return wedge.a1 - wedge.a0 >= TAU - 1e-9
}

/** Ring path for a span that covers the whole circle: two half-arcs, outer then inner. */
function fullRing(cx: number, cy: number, wedge: Wedge): string {
	const { r0, r1 } = wedge
	const ring = (r: number, sweep: number) => {
		const [ax, ay] = at(cx, cy, r, 0)
		const [bx, by] = at(cx, cy, r, Math.PI)

		return (
			`M ${fmt(ax)} ${fmt(ay)} ` +
			`A ${fmt(r)} ${fmt(r)} 0 0 ${sweep} ${fmt(bx)} ${fmt(by)} ` +
			`A ${fmt(r)} ${fmt(r)} 0 0 ${sweep} ${fmt(ax)} ${fmt(ay)} Z`
		)
	}

	// The inner circle is drawn the opposite way round, so the even-odd/nonzero fill punches
	// it out and the result is a ring rather than a disc.
	return r0 > 0 ? `${ring(r1, 1)} ${ring(r0, 0)}` : ring(r1, 1)
}

/**
 * The wedge as a path, centred on `(cx, cy)`.
 *
 * An innermost wedge has `r0 === 0`, where the two inner corners are the same point and an
 * inner arc is undefined — that one is a pie slice, closing through the centre instead.
 */
export function arcPath(cx: number, cy: number, wedge: Wedge): string {
	if (isFullTurn(wedge)) return fullRing(cx, cy, wedge)

	const { r0, r1, a0, a1 } = wedge
	const large = a1 - a0 > Math.PI ? 1 : 0
	const [ox0, oy0] = at(cx, cy, r1, a0)
	const [ox1, oy1] = at(cx, cy, r1, a1)

	const outer =
		`M ${fmt(ox0)} ${fmt(oy0)} A ${fmt(r1)} ${fmt(r1)} 0 ${large} 1 ${fmt(ox1)} ${fmt(oy1)}`

	if (r0 <= 0) return `${outer} L ${fmt(cx)} ${fmt(cy)} Z`

	const [ix1, iy1] = at(cx, cy, r0, a1)
	const [ix0, iy0] = at(cx, cy, r0, a0)

	return (
		`${outer} L ${fmt(ix1)} ${fmt(iy1)} ` +
		`A ${fmt(r0)} ${fmt(r0)} 0 ${large} 0 ${fmt(ix0)} ${fmt(iy0)} Z`
	)
}
