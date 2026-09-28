import { CARD_W, HEAD_H, MORE_H, PAD_B, ROW_H } from './constants.js'
import type { Cards, Density } from './types.js'
import type { GraphNode, GraphRow } from '../types.js'

/** The rows a card shows at the given density (none at 'names'). */
function visibleRows(node: GraphNode, density: Density): GraphRow[] {
	if (density === 'names') return []

	const rows =
		density === 'keys'
			? node.rows.filter((r) => r.badges.includes('pk') || r.badges.includes('fk'))
			: node.rows

	return rows.slice(0, density === 'full' ? 14 : 8)
}

/** Build a card per node. Height is derived from row count — nothing is measured. */
export function buildCards(nodes: GraphNode[], density: Density): Cards {
	const cards: Cards = {}

	for (const node of nodes) {
		const vis = visibleRows(node, density)
		const more = node.rows.length - vis.length
		const h =
			HEAD_H + vis.length * ROW_H + (more > 0 ? MORE_H : 0) + (vis.length || more > 0 ? PAD_B : 0)

		cards[node.id] = { node, vis, more, w: CARD_W, h, x: 0, y: 0 }
	}

	return cards
}
