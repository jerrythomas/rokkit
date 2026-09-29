import { buildCards } from './cards.js'
import {
	barycenterPasses,
	buildAdjacency,
	buildClusters,
	flow,
	groupByGroup,
	orderClusters,
	pack
} from './clusters.js'
import { buildEdges } from './edges.js'
import { warnUnknownOptions } from './options.js'
import { nestedClusters } from './nested.js'
import type { LayoutFn, LayoutResult } from './types.js'

/**
 * Deterministic cluster layout: groups become clusters, clusters are ordered to
 * reduce edge crossings, and each cluster's nodes are masonry-packed then flowed
 * into wrapping rows.
 *
 * `arrange: 'untangle'` (default) chains clusters by inter-group link weight and
 * reorders nodes inside each cluster with barycenter passes. `'a-z'` is plain
 * area-descending order with alphabetical lists.
 */
export const cluster: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'cluster')
	const density = options.density ?? 'keys'
	const arrange = options.arrange ?? 'untangle'

	const cards = buildCards(model.nodes, density, { expanded: options.expanded })

	// Two-level clustering takes its own path — and only when asked. `clusters.ts` carries 20
	// characterization assertions ported from dbd with exact pixel values, so the single-level
	// pipeline below has to keep running byte-identically for every existing caller.
	//
	// Barycenter ordering is deliberately skipped here: it reorders nodes WITHIN one flat
	// cluster to shorten edges, and a node in a nested layout is already pinned by two axes —
	// reordering it could only move it out of the subdivision that explains where it is.
	if (options.nestBy) {
		const { clusters, size } = nestedClusters(
			model.nodes,
			cards,
			options.groupBy ?? 'group',
			options.nestBy
		)

		return { clusters, cards, edges: buildEdges(model.edges, cards), size }
	}
	// NOT model.neighbors. That is a Set; barycenter needs the duplicate-preserving array so a
	// twice-referenced neighbour weighs twice.
	const neighbors = buildAdjacency(model.edges)

	let clusters = buildClusters(groupByGroup(model.nodes, options.groupBy ?? 'group'))
	clusters.forEach((c) => pack(c, cards))
	clusters = orderClusters(clusters, model, arrange)

	let size = flow(clusters, cards)
	if (arrange === 'untangle') size = barycenterPasses(clusters, cards, neighbors)

	return { clusters, cards, edges: buildEdges(model.edges, cards), size }
}
