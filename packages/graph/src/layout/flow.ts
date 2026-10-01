/* The `flow` layout: columns by reference direction, fixed ports, crossings reduced.
 *
 * Raised from the ER diagram — incoming should always enter on the LEFT and outgoing always
 * leave from the RIGHT, and the boxes should be arranged so links are not buried behind
 * entities. Those are ONE feature. `edges.ts` picks a connector's side by relative POSITION,
 * so an edge's exit side tells a reader where the other box happens to sit rather than which
 * way the reference points; and fixing the ports without ranking makes burial worse, because a
 * right-exit connector reaching a left-hand table sweeps back across everything between.
 *
 * Ranking is what makes x-position mean direction, and only then are fixed ports honest.
 *
 * See docs/design/25-flow-layout.md — including what this deliberately does NOT do: a long
 * edge is still drawn straight over any box between its endpoints, because routing it around
 * needs dummy nodes on the intervening ranks and that is its own slice.
 */

import { carried } from './edges.js'
import { buildCards } from './cards.js'
import { rank } from './rank.js'
import { order } from './order.js'
import { warnUnknownOptions } from './options.js'
import { CARD_W, GAP_Y, HEAD_H, ROW_H } from './constants.js'
import type { Cards, LayoutFn, LayoutResult, RoutedEdge, Size } from './types.js'
import type { GraphEdge, GraphModel } from '../types.js'

/**
 * Horizontal gap between columns.
 *
 * Wider than `cluster`'s `GAP_X` on purpose: this gap is where every connector between two
 * columns is drawn, so it is working space rather than breathing room. Too tight and the
 * curves of a fan-out overlap each other before they reach their targets.
 */
const COL_GAP = 120

/** Vertical anchor for a row on a card, matching `edges.ts` so the two agree. */
function anchorY(card: Cards[string], rowName: string | undefined): number {
	const idx = card.vis.findIndex((r) => r.name === rowName)
	if (idx >= 0) return card.y + HEAD_H + idx * ROW_H + ROW_H / 2

	return card.y + HEAD_H / 2
}

/**
 * Place each column left to right, centring every column on a shared axis.
 *
 * Every id in `layers` has a card without checking: both come from `model.nodes`, and
 * `buildCards` keys one entry per node. A guard here would be a branch no input can reach.
 */
function place(layers: string[][], cards: Cards): Size {
	const heights = layers.map((layer) =>
		layer.reduce((total, id) => total + cards[id].h + GAP_Y, -GAP_Y)
	)
	const tallest = Math.max(0, ...heights)

	let x = 0
	layers.forEach((layer, i) => {
		// Centred rather than top-aligned: a short column hanging off the top reads as a
		// hierarchy that is not there, and centring keeps most connectors near-horizontal.
		let y = (tallest - heights[i]) / 2
		for (const id of layer) {
			const card = cards[id]
			card.x = x
			card.y = y
			y += card.h + GAP_Y
		}
		x += CARD_W + COL_GAP
	})

	return { w: Math.max(0, x - COL_GAP), h: tallest }
}

/** The identity half of a routed edge — everything that is not geometry. */
function identity(edge: GraphEdge, i: number) {
	return {
		i,
		id: edge.id,
		fromKey: edge.source,
		toKey: edge.target,
		kind: edge.kind,
		relation: edge.relation,
		...carried(edge)
	}
}

/**
 * A self-reference bows off the right edge — the same shape `edges.ts` gives it, including the
 * nudge that stops a single-row loop collapsing to a point.
 */
function selfLoop(
	edge: GraphEdge,
	i: number,
	at: { x: number; y1: number; y2: number }
): RoutedEdge {
	return {
		...identity(edge, i),
		self: true,
		x1: at.x,
		y1: at.y1,
		x2: at.x,
		y2: at.y2 === at.y1 ? at.y1 + 14 : at.y2,
		s1: 1,
		s2: 1
	}
}

/**
 * One connector, always leaving the right and entering the left.
 *
 * That is the whole point of the layout, so there is no side calculation here at all — unlike
 * `edges.ts`, which derives sides from geometry. A back edge gets the same treatment and pays
 * a visible sweep for it; that is the minority case ranking exists to isolate.
 */
function route(edge: GraphEdge, i: number, cards: Cards, back: Set<string>): RoutedEdge | null {
	const a = cards[edge.source]
	const b = cards[edge.target]
	if (!a || !b) return null

	const y1 = anchorY(a, edge.sourceRow)
	const y2 = anchorY(b, edge.targetRow)
	if (a === b) return selfLoop(edge, i, { x: a.x + a.w, y1, y2 })

	return {
		...identity(edge, i),
		back: back.has(edge.id) || undefined,
		self: false,
		x1: a.x + a.w,
		y1,
		x2: b.x,
		y2,
		s1: 1,
		s2: -1
	}
}

function routeAll(model: GraphModel, cards: Cards, back: Set<string>): RoutedEdge[] {
	const routed: RoutedEdge[] = []
	model.edges.forEach((edge, i) => {
		const e = route(edge, i, cards, back)
		if (e) routed.push(e)
	})

	return routed
}

/**
 * Columns by reference direction, ordered to reduce crossings, with fixed ports.
 *
 * No clusters: ranking and schema grouping compete for the same axis, and a box cannot be both
 * "in the `public` box" and "in column 3". `cluster` remains the schema view.
 */
export const flow: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'flow')

	const cards = buildCards(model.nodes, options.density ?? 'keys', {
		expanded: options.expanded
	})
	if (model.nodes.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const { ranks, back } = rank(model)
	const size = place(order(model, ranks, back), cards)

	return { clusters: [], cards, edges: routeAll(model, cards, back), size }
}
