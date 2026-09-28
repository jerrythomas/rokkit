import { CARD_W, HEAD_H, MORE_H, PAD_B, ROW_H } from './constants.js'
import type { Cards, Density } from './types.js'
import type { GraphNode, GraphRow } from '../types.js'

export type CardOptions = {
	/** Row cap. Defaults to 14 at density 'full', 8 otherwise. */
	limit?: number
	/**
	 * Extra row filter applied before the cap, in place of the density's own.
	 *
	 * `more` still counts against ALL of the node's rows, which is why this belongs here
	 * rather than at the call site: filtering a node's rows before calling would report
	 * "+0 more" on a card that is in fact hiding most of its rows, and drop the more-row's
	 * height with it.
	 */
	select?: (row: GraphRow, node: GraphNode) => boolean
}

/** The rows a card shows at the given density (none at 'names'). */
function visibleRows(node: GraphNode, density: Density, options: CardOptions): GraphRow[] {
	if (density === 'names') return []

	const rows = selectedRows(node, density, options.select)

	return rows.slice(0, options.limit ?? (density === 'full' ? 14 : 8))
}

function selectedRows(
	node: GraphNode,
	density: Density,
	select: CardOptions['select']
): GraphRow[] {
	if (select) return node.rows.filter((r) => select(r, node))
	if (density === 'keys') {
		return node.rows.filter((r) => r.badges.includes('pk') || r.badges.includes('fk'))
	}
	return node.rows
}

/** Build a card per node. Height is derived from row count — nothing is measured. */
export function buildCards(
	nodes: GraphNode[],
	density: Density,
	options: CardOptions = {}
): Cards {
	const cards: Cards = {}

	for (const node of nodes) {
		const vis = visibleRows(node, density, options)
		const more = node.rows.length - vis.length
		const h =
			HEAD_H + vis.length * ROW_H + (more > 0 ? MORE_H : 0) + (vis.length || more > 0 ? PAD_B : 0)

		cards[node.id] = { node, vis, more, w: CARD_W, h, x: 0, y: 0 }
	}

	return cards
}
