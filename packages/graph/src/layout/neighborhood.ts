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
import { rings, type Ring, type Side } from './rings.js'
import { CARD_W } from './constants.js'
import type { Card, Cards, Column, LayoutFn, LayoutResult, Size } from './types.js'
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

const EMPTY: LayoutResult = { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 }, columns: [] }

/**
 * Column headings, worded for the KIND of graph rather than configured.
 *
 * The same layout draws a call graph and an ER diagram, and "calls" is simply wrong for the
 * latter. The model already knows which it is, so the wording follows the edges instead of
 * asking the consumer to supply strings that must then be kept in step.
 */
function headings(dependency: boolean): { in: string[]; out: string[] } {
	return dependency
		? { in: ['called by', 'callers of callers'], out: ['calls', 'which call'] }
		: { in: ['referenced by', 'their references'], out: ['references', 'which reference'] }
}

function headingFor(side: Side, depth: number, dependency: boolean): string {
	const words = headings(dependency)[side]

	return words[depth - 1] ?? `${words[0]} · ${depth} hops`
}

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

/**
 * Stack height of a column of cards — gaps between them, not after the last.
 *
 * Seeded at `-STACK_GAP` so the trailing gap cancels without a subtraction, and clamped at 0
 * so an empty column is 0 rather than a negative height. No early return: the callers filter
 * empty rings already, so a guard here would be a branch no test could reach.
 */
function stackHeight(cards: Card[]): number {
	return Math.max(0, cards.reduce((total, card) => total + card.h + STACK_GAP, -STACK_GAP))
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
 * Place every ring, size the canvas, and name the columns.
 *
 * An EMPTY ring costs no width: a depth-2 request on a graph with nothing at depth 2 must not
 * leave a gap where that column would have been, so the width is measured from the deepest
 * column that actually exists rather than from the depth asked for. An empty SIDE is
 * different (#170): the focus is centred, so the shallower side reserves the deeper side's
 * columns — otherwise "centred" would only hold for a node with neighbours both ways.
 */
function arrange(
	built: Ring[],
	cards: Cards,
	ctx: { focus: GraphNode; hasLoop: boolean; dependency: boolean }
): { columns: Column[]; size: Size } {
	const occupied = built.filter((r) => r.ids.length > 0)
	// The same edge room on BOTH sides — a self-loop's bow plus a hairline — so the canvas
	// stays symmetric about the focus.
	const edge = (ctx.hasLoop ? LOOP_W : 0) + 2
	const { focusX, xFor } = geometry(occupied, edge)
	const focusCard = cards[ctx.focus.id]

	const height = placeRings(occupied, cards, { focusCard, focusX, xFor })
	const columns = buildColumns(occupied, {
		focusX,
		focusLabel: ctx.focus.label,
		xFor,
		dependency: ctx.dependency
	})
	// Symmetric about the focus (#170): as much room right of it as left, so the focus card's
	// centre IS the canvas's centre whichever side is empty or deeper.
	const width = focusX * 2 + CARD_W

	return { columns, size: { w: width, h: height } }
}

/**
 * Which side ring 1 puts each neighbour on.
 *
 * The DOMINANT direction, not "has an out edge at all" (#160). A node with edges both ways is
 * routine in a call graph — mutual recursion, a callback registered with its invoker, a
 * visitor dispatching back into its walker — and testing `out.length > 0` put every one of
 * them on the right, drawing its inbound edge right-to-left against the convention this
 * layout states.
 *
 * One card per node is the constraint, so a TIE still draws one edge backwards whichever side
 * wins. `in` is the deliberate pick: that column reads "things that reach this", which is what
 * a reader scans for before changing something.
 */
function sideOf(neighbours: Neighbour[]): (id: string) => Side {
	const outward = new Set(neighbours.filter((n) => n.out.length > n.in.length).map((n) => n.id))

	return (id) => (outward.has(id) ? 'out' : 'in')
}

/**
 * Edges with BOTH ends placed, rather than "touches the focus".
 *
 * At depth 1 those are the same set — everything on the canvas is a direct neighbour — so the
 * one-hop picture is unchanged. At depth 2 they differ: an edge from ring 1 to ring 2 touches
 * no focus, and showing it is exactly what the second ring is for.
 */
function drawableIn(model: GraphModel, cards: Cards) {
	return model.edges.filter((e) => cards[e.source] !== undefined && cards[e.target] !== undefined)
}

/**
 * Where each ring sits. Ring d on the `in` side is d steps left of the focus; on the `out`
 * side, d steps right. The focus sits past `edge` and as many columns as the DEEPER side
 * needs, so both sides get the same room and the focus is the centre.
 */
function geometry(
	occupied: Ring[],
	edge: number
): {
	focusX: number
	xFor: (side: Side, depth: number) => number
} {
	const columnStep = CARD_W + COL_GAP
	const reach = Math.max(furthest(occupied, 'in'), furthest(occupied, 'out'))
	const focusX = edge + reach * columnStep

	return {
		focusX,
		xFor: (side, d) => (side === 'in' ? focusX - d * columnStep : focusX + d * columnStep)
	}
}

/**
 * Cards for everything on the canvas.
 *
 * Three populations, three treatments: the focus shows up to 16 rows unfiltered, a direct
 * neighbour shows its keys plus the rows the focus references, and a node further out shows
 * keys only — at two hops the reader is tracing reach, not reading columns.
 */
function buildRingCards(
	model: GraphModel,
	neighbours: Neighbour[],
	ring: { placed: GraphNode[]; focus: GraphNode; expanded: ReadonlySet<string> | undefined }
): Cards {
	const { placed, focus, expanded } = ring
	const direct = new Set(neighbours.map((n) => n.id))

	return {
		...buildNeighbourCards(model, neighbours, expanded),
		...buildCards(
			placed.filter((n) => !direct.has(n.id)),
			'keys',
			{ expanded }
		),
		...buildCards([focus], 'full', { limit: 16, expanded })
	}
}

/**
 * Stack every ring into its column and centre the focus beside them. Returns the canvas
 * height, which is the tallest stack — every column is vertically centred against it, so a
 * short ring beside a long one reads as beside rather than above.
 */
function placeRings(
	occupied: Ring[],
	cards: Cards,
	ctx: { focusCard: Card; focusX: number; xFor: (side: Side, depth: number) => number }
): number {
	const stacks = occupied.map((ring) => ({
		ring,
		cards: ring.ids.map((id) => cards[id]).filter((c) => c !== undefined)
	}))
	const height =
		Math.max(ctx.focusCard.h, ...stacks.map((s) => stackHeight(s.cards)), MIN_H) + H_PAD

	for (const { ring, cards: column } of stacks) {
		placeColumn(column, ctx.xFor(ring.side, ring.depth), height)
	}
	placeColumn([ctx.focusCard], ctx.focusX, height)

	return height
}

/** Deepest occupied ring on one side, or 0 when that side is empty. */
function furthest(occupied: Ring[], side: Side): number {
	const depths = occupied.filter((r) => r.side === side).map((r) => r.depth)

	return depths.length > 0 ? Math.max(...depths) : 0
}

type ColumnContext = {
	focusX: number
	focusLabel: string
	xFor: (side: Side, depth: number) => number
	dependency: boolean
}

/** Headings left-to-right: inbound rings, the focus, then outbound rings. */
function buildColumns(occupied: Ring[], ctx: ColumnContext): Column[] {
	const side = (which: Side): Column[] =>
		occupied
			.filter((r) => r.side === which)
			.map((r) => ({
				x: ctx.xFor(which, r.depth),
				w: CARD_W,
				depth: r.depth,
				side: which,
				label: headingFor(which, r.depth, ctx.dependency)
			}))
			.sort((a, b) => a.x - b.x)

	return [
		...side('in'),
		{ x: ctx.focusX, w: CARD_W, depth: 0, side: 'focus' as const, label: ctx.focusLabel },
		...side('out')
	]
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
	const built = rings(
		model,
		focus.id,
		Math.max(1, Math.floor(options.depth ?? 1)),
		sideOf(neighbours)
	)

	const placedNodes = built
		.flatMap((r) => r.ids)
		.map((id) => model.byId.get(id))
		.filter((n) => n !== undefined)
	const cards = buildRingCards(model, neighbours, {
		placed: placedNodes,
		focus,
		expanded: options.expanded
	})

	const { columns, size } = arrange(built, cards, {
		focus,
		hasLoop: selfEdges.length > 0,
		dependency: model.edges.some((e) => e.kind === 'dependency')
	})

	return { clusters: [], cards, edges: buildEdges(drawableIn(model, cards), cards), size, columns }
}
