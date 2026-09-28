/**
 * The STATE layer's demo half.
 *
 * This holds only the explorer's own chrome — which dataset, which view, which control
 * values. The package's `GraphState` holds everything derived from them, and is NOT
 * reimplemented here. Keeping the two apart is the thing the demo is meant to show.
 */

import type { DatasetId } from './datasets'

export type GraphViewId = 'diagram' | 'entity' | 'entities'
export type LayoutId = 'cluster' | 'neighborhood' | 'points'
export type DensityId = 'names' | 'keys' | 'full'
export type ArrangeId = 'untangle' | 'a-z'
export type EdgeStyleId = 'curved' | 'orthogonal'
export type ChannelId = 'color' | 'pattern'

class GraphExplorerStore {
	dataset = $state<DatasetId>('ecommerce')
	view = $state<GraphViewId>('diagram')
	layout = $state<LayoutId>('cluster')
	density = $state<DensityId>('keys')
	arrange = $state<ArrangeId>('untangle')
	edgeStyle = $state<EdgeStyleId>('curved')
	using = $state<ChannelId>('color')
	/** Multiplier on Graph's fit-to-container scale. 1 = fit the whole diagram. */
	zoom = $state<number>(1)

	/**
	 * Switching dataset drops the selection: an id from the previous dataset names nothing in
	 * the new one, which would leave the entity view empty with no visible reason why.
	 */
	selectDataset(id: DatasetId): void {
		this.dataset = id
		// A call graph is a dense graph: cards are the wrong unit for it, and `points` is the
		// answer to "what does this look like with a thousand nodes". The two schema views keep
		// cards, which are right when a node HAS columns worth reading — and a dependency node
		// that has none still reads as a titled card among the tables it touches.
		this.layout = id === 'service-calls' ? 'points' : 'cluster'
	}
}

export const explorer = new GraphExplorerStore()
