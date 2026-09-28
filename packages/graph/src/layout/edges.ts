/* Edge routing — anchor points, connector geometry, SVG paths.

   Ported from dbd's layout-edges.ts. All geometry is unchanged: the 50px side-gap
   threshold, the +14 same-anchor nudge, the 46px self-loop bow, the 64px same-side
   bow, the [46, 170] control-point clamp and the +52 orthogonal sweep. */

import { HEAD_H, ROW_H } from './constants.js'
import type { Card, Cards, EdgeStyle, RoutedEdge } from './types.js'
import type { GraphEdge } from '../types.js'

/**
 * Vertical anchor for a row's edge endpoint on a card.
 *
 * `rowName` is optional because a canonical edge need not name one — a dependency
 * edge (a view reading a table) has no column anchors at all. An unset name takes
 * the same head-centre fallback a non-matching name already took.
 */
function anchorY(card: Card, rowName: string | undefined): number {
	const idx = card.vis.findIndex((r) => r.name === rowName)
	if (idx >= 0) return card.y + HEAD_H + idx * ROW_H + ROW_H / 2
	return card.y + HEAD_H / 2
}

/** A self-reference: loop on the right edge of the card. */
function selfLoop(
	edge: GraphEdge,
	i: number,
	card: Card,
	{ y1, y2 }: { y1: number; y2: number }
): RoutedEdge {
	return {
		i,
		id: edge.id,
		fromKey: edge.source,
		toKey: edge.target,
		kind: edge.kind,
		relation: edge.relation,
		self: true,
		x1: card.x + card.w,
		y1,
		x2: card.x + card.w,
		y2: y2 === y1 ? y1 + 14 : y2,
		s1: 1,
		s2: 1
	}
}

/** Which side of each card the connector leaves from. 1 = right, -1 = left. */
function sides(a: Card, b: Card): { s1: number; s2: number } {
	if (a.x + a.w + 50 <= b.x) return { s1: 1, s2: -1 }
	if (b.x + b.w + 50 <= a.x) return { s1: -1, s2: 1 }
	return { s1: 1, s2: 1 } // stacked: route around the right
}

/** Geometry for a single edge: a self-loop on the right edge, or a side-routed connector. */
function buildEdge(edge: GraphEdge, i: number, cards: Cards): RoutedEdge | null {
	const a = cards[edge.source]
	const b = cards[edge.target]
	if (!a || !b) return null

	const y1 = anchorY(a, edge.sourceRow)
	const y2 = anchorY(b, edge.targetRow)

	if (a === b) return selfLoop(edge, i, a, { y1, y2 })

	const { s1, s2 } = sides(a, b)

	return {
		i,
		id: edge.id,
		fromKey: edge.source,
		toKey: edge.target,
		kind: edge.kind,
		relation: edge.relation,
		self: false,
		x1: s1 === 1 ? a.x + a.w : a.x,
		y1,
		x2: s2 === 1 ? b.x + b.w : b.x,
		y2,
		s1,
		s2
	}
}

/** Build all edge geometry, skipping edges whose endpoints aren't laid out. */
export function buildEdges(edges: GraphEdge[], cards: Cards): RoutedEdge[] {
	const routed: RoutedEdge[] = []

	edges.forEach((edge, i) => {
		const e = buildEdge(edge, i, cards)
		if (e) routed.push(e)
	})

	return routed
}

/** Right-angle route: opposite sides join at the x-midpoint, same-side (stacked) sweeps around the right. */
function orthogonalPath(e: RoutedEdge): string {
	const { x1, y1, x2, y2, s1, s2 } = e

	if (s1 !== s2) {
		const mid = (x1 + x2) / 2
		return `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`
	}

	const out = Math.max(x1, x2) + 52
	return `M ${x1} ${y1} H ${out} V ${y2} H ${x2}`
}

/** Bezier route: same-side bows outward by a fixed amount, opposite-side bows by half the x distance (clamped). */
function curvedPath(e: RoutedEdge): string {
	const { x1, y1, x2, y2, s1, s2 } = e

	if (s1 === s2) {
		const bow = 64
		return `M ${x1} ${y1} C ${x1 + bow * s1} ${y1}, ${x2 + bow * s2} ${y2}, ${x2} ${y2}`
	}

	const dx = Math.max(46, Math.min(170, Math.abs(x2 - x1) / 2))
	return `M ${x1} ${y1} C ${x1 + dx * s1} ${y1}, ${x2 + dx * s2} ${y2}, ${x2} ${y2}`
}

export function edgePath(e: RoutedEdge, style: EdgeStyle): string {
	if (e.self) {
		const { x1, y1, x2, y2 } = e
		const bow = 46
		return `M ${x1} ${y1} C ${x1 + bow} ${y1}, ${x2 + bow} ${y2}, ${x2} ${y2}`
	}

	return style === 'orthogonal' ? orthogonalPath(e) : curvedPath(e)
}
