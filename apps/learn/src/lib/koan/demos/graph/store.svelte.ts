/**
 * The STATE layer's demo half.
 *
 * This holds only the explorer's own chrome — which dataset, which view, which control
 * values. The package's `GraphState` holds everything derived from them, and is NOT
 * reimplemented here. Keeping the two apart is the thing the demo is meant to show.
 */

import type { DatasetId } from './datasets'

export type GraphViewId = 'diagram' | 'entity' | 'entities'
export type LayoutId = 'cluster' | 'flow' | 'neighborhood' | 'points' | 'world'
export type DensityId = 'names' | 'keys' | 'full'
export type ArrangeId = 'untangle' | 'a-z'
export type EdgeStyleId = 'curved' | 'orthogonal'

/**
 * How the boxes are organised. One setting rather than two axes, because the invalid pair
 * (the same axis outer AND inner) would subdivide a box by itself — one child holding
 * everything, which reads as a rendering fault rather than a no-op.
 */
export type GroupingId = 'schema' | 'kind' | 'schema-kind' | 'kind-schema'

export const GROUPING: Record<GroupingId, { groupBy: 'group' | 'kind'; nestBy?: 'group' | 'kind' }> =
	{
		schema: { groupBy: 'group' },
		kind: { groupBy: 'kind' },
		'schema-kind': { groupBy: 'group', nestBy: 'kind' },
		'kind-schema': { groupBy: 'kind', nestBy: 'group' }
	}
export type ChannelId = 'color' | 'pattern'

class GraphExplorerStore {
	dataset = $state<DatasetId>('ecommerce')
	view = $state<GraphViewId>('diagram')
	layout = $state<LayoutId>('flow')
	/** Paint each card with its schema colour — `flow` has no cluster boxes to carry it. */
	groupTint = $state(true)
	density = $state<DensityId>('keys')
	arrange = $state<ArrangeId>('untangle')
	edgeStyle = $state<EdgeStyleId>('curved')
	using = $state<ChannelId>('color')
	grouping = $state<GroupingId>('schema')
	sizeBy = $state<string>('degree')
	/** Multiplier on Graph's fit-to-container scale. 1 = fit the whole diagram. */
	zoom = $state<number>(1)

	/**
	 * Switching dataset drops the selection: an id from the previous dataset names nothing in
	 * the new one, which would leave the entity view empty with no visible reason why.
	 */
	selectDataset(id: DatasetId): void {
		this.dataset = id
		// Schema is the right axis for an ER diagram and a poor one for a dependency graph,
		// where one schema holds a table, a trigger and a procedure. Defaulting per dataset
		// means the view opens on the question that dataset is FOR; the control still moves it.
		this.grouping = id === 'schema-deps' ? 'schema-kind' : 'schema'
		// A call graph is a dense graph: cards are the wrong unit for it, and `points` is the
		// answer to "what does this look like with a thousand nodes". The two schema views keep
		// cards, which are right when a node HAS columns worth reading — and a dependency node
		// that has none still reads as a titled card among the tables it touches.
		// Each dataset opens on the view it is FOR: a codebase is containment with a quantity
		// at every level, which is the treemap's question and nothing else's.
		if (id === 'codebase') {
			this.layout = 'world'
			this.sizeBy = 'declarations'
		} else {
			this.layout = id === 'service-calls' ? 'points' : 'flow'
		}
	}
}

export const explorer = new GraphExplorerStore()
