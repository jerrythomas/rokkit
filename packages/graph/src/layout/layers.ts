/* The layered view (#167): modules ranked into horizontal layers, foundations at the bottom.
 *
 * Sugiyama-shaped, but the expensive half — assigning layers — is the HOST's: it knows the
 * intended architecture, and rokkit computes no depth. What is left is placement and the
 * one thing the view exists to show: edges should only point DOWN, and the ones that climb are
 * violations.
 *
 *   - one full-width band per layer, layer 0 at the top, drawn as a cluster box so it renders
 *     through the existing box path with its label;
 *   - a crowded layer wraps into rows rather than one line a thousand cards long;
 *   - a layer is ordered by one barycenter pass against the layer above — each node under the
 *     mean position of its neighbours there — which removes most of the avoidable crossings;
 *   - edges are vertical S-curves, and carry their conformance for the theme to colour.
 */
import { buildCards } from './cards.js'
import { CARD_W } from './constants.js'
import { carried, keepsEdge } from './edges.js'
import { warnUnknownOptions } from './options.js'
import type { Cards, Cluster, LayoutFn, LayoutResult, RoutedEdge, ShowEdges } from './types.js'
import type { Conformance, GraphEdge, GraphModel, GraphNode } from '../types.js'

/** Cards per row before a layer wraps. */
const PER_ROW = 8
const GAP_X = 28
const GAP_ROW = 20
/** Space between one band and the next — where the edges run. */
const GAP_BAND = 56
/** Inner padding of a band, and the strip its label sits in. */
const PAD = 20
const TITLE = 22

/** The band a node belongs to: its layer, or none (drawn last, as Unassigned). */
const UNASSIGNED = Number.POSITIVE_INFINITY

const layerOf = (node: GraphNode) => node.layer ?? UNASSIGNED

/** How an edge sits against the layering, from the two layers the host gave. */
export function deriveConformance(from?: number, to?: number): Conformance | undefined {
	if (from === undefined || to === undefined) return undefined
	if (to === from) return 'level'
	if (to < from) return 'up'
	return to - from === 1 ? 'down' : 'skip'
}

/** Nodes grouped by layer, in band order (Unassigned last). */
function bandsOf(model: GraphModel): [number, GraphNode[]][] {
	const bands = new Map<number, GraphNode[]>()
	for (const node of model.nodes) {
		const key = layerOf(node)
		bands.set(key, [...(bands.get(key) ?? []), node])
	}
	return [...bands.entries()].sort(([a], [b]) => a - b)
}

/** Undirected neighbour ids per node — the barycenter reads both directions. */
function neighbours(model: GraphModel): Map<string, string[]> {
	const near = new Map<string, string[]>()
	const link = (a: string, b: string) => near.set(a, [...(near.get(a) ?? []), b])
	for (const e of model.edges) {
		if (e.source === e.target) continue
		link(e.source, e.target)
		link(e.target, e.source)
	}
	return near
}

/**
 * Order each band: the first alphabetically, every later one by the mean index of its
 * neighbours in the band above (alphabetical among nodes with none there).
 */
function order(bands: [number, GraphNode[]][], near: Map<string, string[]>): GraphNode[][] {
	const ordered: GraphNode[][] = []
	let above = new Map<string, number>()
	for (const [, nodes] of bands) {
		const centre = (n: GraphNode) => {
			const hits = (near.get(n.id) ?? []).map((id) => above.get(id)).filter((i) => i !== undefined)
			return hits.length > 0 ? hits.reduce((s, i) => s + i, 0) / hits.length : Number.POSITIVE_INFINITY
		}
		const band = [...nodes].sort((a, b) => centre(a) - centre(b) || a.label.localeCompare(b.label))
		ordered.push(band)
		above = new Map(band.map((n, i) => [n.id, i]))
	}
	return ordered
}

const chunk = <T>(items: T[], size: number): T[][] =>
	Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size))

const rowWidth = (count: number) => count * CARD_W + Math.max(0, count - 1) * GAP_X

/** Place one band's cards, row by row, centred in the shared width. Returns the band height. */
function placeBand(band: GraphNode[], cards: Cards, top: number, width: number): number {
	let y = top + TITLE + PAD
	const rows = chunk(band, PER_ROW)
	rows.forEach((row, r) => {
		let x = (width - rowWidth(row.length)) / 2
		const tallest = Math.max(...row.map((n) => cards[n.id].h))
		for (const node of row) {
			Object.assign(cards[node.id], { x, y })
			x += CARD_W + GAP_X
		}
		y += tallest + (r < rows.length - 1 ? GAP_ROW : 0)
	})
	return y + PAD - top
}

const labelFor = (layer: number, labels: string[] | undefined) =>
	layer === UNASSIGNED ? 'Unassigned' : (labels?.[layer] ?? `Layer ${layer}`)

/** A vertical S: out of the bottom of a card above, into the top of a card below (or reverse). */
function route(edge: GraphEdge, i: number, cards: Cards, conformance?: Conformance): RoutedEdge {
	const a = cards[edge.source]
	const b = cards[edge.target]
	const downward = b.y >= a.y + a.h
	const x1 = a.x + a.w / 2
	const x2 = b.x + b.w / 2
	const y1 = downward ? a.y + a.h : a.y
	const y2 = downward ? b.y : b.y + b.h
	const mid = (y1 + y2) / 2
	return {
		i,
		id: edge.id,
		fromKey: edge.source,
		toKey: edge.target,
		kind: edge.kind,
		relation: edge.relation,
		...carried(edge),
		...(conformance ? { conformance } : {}),
		self: false,
		x1,
		y1,
		x2,
		y2,
		s1: 1,
		s2: 1,
		path: `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`
	}
}

function edgesFor(model: GraphModel, cards: Cards, showEdges: ShowEdges): RoutedEdge[] {
	const routed: RoutedEdge[] = []
	model.edges.forEach((edge, i) => {
		if (edge.source === edge.target || !cards[edge.source] || !cards[edge.target]) return
		const conformance =
			edge.conformance ??
			deriveConformance(cards[edge.source].node.layer, cards[edge.target].node.layer)
		const routedEdge = route(edge, i, cards, conformance)
		if (keepsEdge(showEdges, routedEdge)) routed.push(routedEdge)
	})
	return routed
}

/** Stack the bands top to bottom, each a full-width labelled box around its cards. */
function placeBands(
	ordered: GraphNode[][],
	layerKeys: number[],
	cards: Cards,
	{ width, labels }: { width: number; labels: string[] | undefined }
): { clusters: Cluster[]; height: number } {
	const clusters: Cluster[] = []
	let top = 0
	ordered.forEach((band, i) => {
		const h = placeBand(band, cards, top, width)
		clusters.push({
			name: labelFor(layerKeys[i], labels),
			caption: String(band.length),
			list: band,
			count: band.length,
			groupIndex: i,
			depth: 0,
			x: 0,
			y: top,
			w: width,
			h
		})
		top += h + GAP_BAND
	})
	return { clusters, height: top - GAP_BAND }
}

/** Host-assigned layers as horizontal bands, layer 0 at the top. */
export const layers: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'layers')
	if (model.nodes.length === 0) return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }

	const cards = buildCards(model.nodes, options.density ?? 'names', { expanded: options.expanded })
	const bands = bandsOf(model)
	const ordered = order(bands, neighbours(model))
	const width = rowWidth(Math.min(PER_ROW, Math.max(...ordered.map((b) => b.length)))) + PAD * 2

	const { clusters, height } = placeBands(
		ordered,
		bands.map(([layer]) => layer),
		cards,
		{ width, labels: options.layerLabels }
	)

	return {
		clusters,
		cards,
		edges: edgesFor(model, cards, options.showEdges ?? 'all'),
		size: { w: width, h: height }
	}
}
