/**
 * The words the state produces, from `messages.graph` (see `messages.ts`). Pure functions of
 * their inputs and the active locale, so the canvas has no English of its own and each is
 * testable without a renderer.
 */
import { counted, say } from '../messages.js'
import { sideOf } from '../layout/arcs.js'
import type { Card, ChannelScale, Density, LayoutResult, PolymetricChannel } from '../layout/types.js'
import type { GraphEdge } from '../types.js'

/** The default accessible name: what the diagram holds. */
export function diagramLabel(nodes: number, edges: number): string {
	return say('diagram', {
		nodes: counted(nodes, 'nodeOne', 'nodeMany'),
		edges: counted(edges, 'relationshipOne', 'relationshipMany')
	})
}

/**
 * The "more rows" control on a card: `show less` when expanded, `+ N more` when rows are
 * hidden, and `no keys · N rows` when a key filter matched nothing (see `GraphState.moreLabel`).
 */
export function moreRowsLabel(
	expanded: boolean,
	card: Pick<Card, 'more' | 'vis'> | undefined,
	density: Density
): string | null {
	if (expanded) return say('less')
	if (!card || card.more <= 0) return null
	// Only `keys` filters rows by a property — at `names` an empty card is what was asked for.
	if (density !== 'keys' || card.vis.length > 0) return say('more', { n: card.more })
	return say('noKeys', { rows: counted(card.more, 'rowOne', 'rowMany') })
}

export type ChannelRow = { key: PolymetricChannel; label: string; scale: ChannelScale }

const CHANNEL_LABEL = { width: 'width', height: 'height', color: 'shade' } as const

/** One legend row per polymetric channel present, labelled from the locale (#168). */
export function channelRows(channels: LayoutResult['channels']): ChannelRow[] {
	if (!channels) return []
	const keys: PolymetricChannel[] = channels.color ? ['width', 'height', 'color'] : ['width', 'height']
	return keys.map((key) => ({ key, label: say(CHANNEL_LABEL[key]), scale: channels[key]! }))
}

/**
 * What each side of an arc diagram shows (#169): the relations drawn there, from the data, or
 * Declared / Observed from the locale when a side's edges name none.
 */
export function sideNames(edges: GraphEdge[], above: string | undefined): { below: string; above: string } {
	const named = { below: new Set<string>(), above: new Set<string>() }
	for (const edge of edges) if (edge.relation) named[sideOf(edge, above)].add(edge.relation)
	const name = (side: 'below' | 'above', fallback: 'sideBelow' | 'sideAbove') =>
		named[side].size > 0 ? [...named[side]].join(' · ') : say(fallback)
	return { below: name('below', 'sideBelow'), above: name('above', 'sideAbove') }
}
