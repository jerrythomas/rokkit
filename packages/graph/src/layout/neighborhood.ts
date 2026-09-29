/* Entity-centric layout: the focus node centred, nodes that reference it stacked on
   the left, nodes it references on the right.

   EXACTLY ONE HOP, always. There is no depth option, and a caller passing one gets a warning
   rather than silence (#162) — a two-hop view is a different picture with its own problems
   (a hub explodes, and five columns need headings to be readable at all), not a parameter.

   Ported from dbd's EntityDiagram.svelte. That component carried its own geometry
   constants, buildCard, anchorY and path — roughly 100 lines duplicating cards.ts and
   edges.ts with slightly different numbers. Here it reuses both, so the duplication is
   gone rather than moved. The one visible consequence: self-loops now use the shared
   +14 anchor nudge and 46px bow instead of EntityDiagram's +16 and 52px. */

import { buildCards } from './cards.js'
import { buildEdges } from './edges.js'
import { warnUnknownOptions } from './options.js'
import { CARD_W } from './constants.js'
import type { Card, Cards, LayoutFn, LayoutResult } from './types.js'
import type { GraphEdge, GraphModel, GraphNode } from '../types.js'

/* Local to this layout and deliberately NOT the cluster gaps in constants.ts: this is
   a three-column portrait, not a masonry grid, so it wants a wide horizontal gutter and
   a tight vertical one. */
const COL_GAP = 170
const STACK_GAP = 26

/** Floor and padding on the canvas, so a one-row neighbourhood is not a sliver. */
const MIN_H = 120
const H_PAD = 20
/** Extra width reserved to the right of the focus card for self-loop bows. */
const LOOP_W = 60

const EMPTY: LayoutResult = { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }

/** Edges touching the focus, split by direction. `out` = the focus references the neighbour. */
type Neighbour = { id: string; in: GraphEdge[]; out: GraphEdge[] }

type Partitioned = { neighbours: Neighbour[]; selfEdges: GraphEdge[] }

function partition(model: GraphModel, focusId: string): Partitioned {
	const byNeighbour = new Map<string, Neighbour>()
	const selfEdges: GraphEdge[] = []

	const entry = (id: string) => {
		const found = byNeighbour.get(id) ?? { id, in: [], out: [] }
		byNeighbour.set(id, found)
		return found
	}

	for (const edge of model.edges) {
		// An unplaced endpoint is not a node, so it has no card and cannot be a neighbour.
		// The relationship is still real and still reported by GraphState.relationships —
		// it simply has nothing to draw here.
		if (edge.unplaced) continue

		const isFrom = edge.source === focusId
		const isTo = edge.target === focusId

		if (isFrom && isTo) selfEdges.push(edge)
		else if (isFrom) entry(edge.target).out.push(edge)
		else if (isTo) entry(edge.source).in.push(edge)
	}

	return { neighbours: [...byNeighbour.values()], selfEdges }
}

/**
 * Rows a neighbour card reveals: its own keys, plus whichever rows the focus actually
 * references. Everything else stays behind the more-count.
 */
function referencedRows(neighbour: Neighbour): Set<string> {
	const names = new Set<string>()

	for (const edge of neighbour.in) if (edge.sourceRow) names.add(edge.sourceRow)
	for (const edge of neighbour.out) if (edge.targetRow) names.add(edge.targetRow)

	return names
}

/** Stack height of a column of cards, gaps between but not after. */
function stackHeight(cards: Card[]): number {
	if (cards.length === 0) return 0
	return cards.reduce((total, card) => total + card.h + STACK_GAP, 0) - STACK_GAP
}

/** Place a column of cards at `x`, vertically centred within `height`. */
function placeColumn(cards: Card[], x: number, height: number): void {
	let y = (height - stackHeight(cards)) / 2

	for (const card of cards) {
		card.x = x
		card.y = y
		y += card.h + STACK_GAP
	}
}

function buildNeighbourCards(
	model: GraphModel,
	neighbours: Neighbour[],
	expanded: ReadonlySet<string> | undefined
): Cards {
	const nodes = neighbours
		.map((n) => model.byId.get(n.id))
		.filter((n): n is GraphNode => n !== undefined)

	const wanted = new Map(neighbours.map((n) => [n.id, referencedRows(n)]))

	return buildCards(nodes, 'full', {
		limit: 8,
		expanded,
		select: (row, node) => row.badges.includes('pk') || (wanted.get(node.id)?.has(row.name) ?? false)
	})
}

/**
 * Entity-centric layout. `options.focus` names the node to centre; without it, or with
 * an id the model does not know, the result is empty.
 *
 * The focus card shows up to 16 rows unfiltered. Each neighbour shows only its keys and
 * the rows the focus references, capped at 8 — both caps carried over from dbd.
 */
export const neighborhood: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'neighborhood')

	const focus = options.focus ? model.byId.get(options.focus) : undefined
	if (!focus) return EMPTY

	const { neighbours, selfEdges } = partition(model, focus.id)
	const cards: Cards = {
		...buildNeighbourCards(model, neighbours, options.expanded),
		...buildCards([focus], 'full', { limit: 16, expanded: options.expanded })
	}

	const focusCard = cards[focus.id]
	/*
	 * A neighbour the focus points at sits right; one that points at the focus sits left.
	 *
	 * Split on the DOMINANT direction, not on "has an out edge at all" (#160). A node with
	 * edges both ways is routine in a call graph — mutual recursion, a callback registered
	 * with its invoker, a visitor dispatching back into its walker — and testing
	 * `out.length > 0` put every one of them on the right, drawing its inbound edge
	 * right-to-left against the convention this layout states.
	 *
	 * One card per node is the constraint, so a TIE still draws one edge backwards whichever
	 * side wins. Left is the deliberate pick: that column reads "things that reach this",
	 * which is what a reader scans for before changing something.
	 */
	const isRight = (n: (typeof neighbours)[number]) => n.out.length > n.in.length
	const right = neighbours.filter(isRight).map((n) => cards[n.id])
	const left = neighbours.filter((n) => !isRight(n)).map((n) => cards[n.id])

	const height = Math.max(focusCard.h, stackHeight(left), stackHeight(right), MIN_H) + H_PAD
	const hasRight = right.length > 0 || selfEdges.length > 0
	const focusX = left.length > 0 ? CARD_W + COL_GAP : 0

	placeColumn(left, 0, height)
	placeColumn([focusCard], focusX, height)
	placeColumn(right, focusX + CARD_W + COL_GAP, height)

	const width =
		focusX +
		CARD_W +
		(hasRight ? COL_GAP + CARD_W : 0) +
		(selfEdges.length > 0 ? LOOP_W : 0) +
		4

	// Only edges touching the focus. buildEdges would otherwise connect two neighbours
	// that happen to both be laid out, which this view never shows.
	const touching = model.edges.filter((e) => e.source === focus.id || e.target === focus.id)

	return { clusters: [], cards, edges: buildEdges(touching, cards), size: { w: width, h: height } }
}
