/**
 * The STATE layer's demo half.
 *
 * Holds only the explorer's own chrome — which DIAGRAM, which view, which colour channel.
 * Everything a diagram itself controls (density, depth, edge style, zoom) now lives in the
 * diagram component, because those are the controls it publishes. Reimplementing them here
 * would put the same value in two places and let them drift.
 */

import { registry, type DiagramId } from './registry'

export type GraphViewId = 'diagram' | 'entity' | 'entities'
export type ChannelId = 'color' | 'pattern'

class GraphExplorerStore {
	/**
	 * The diagram, which carries its dataset with it.
	 *
	 * Not two independent pickers: an ER dataset pointed at a radial tree draws a hierarchy
	 * that table entities do not have, and the reader is left deciding whether the picture or
	 * the data is wrong.
	 */
	diagram = $state<DiagramId>('er')
	view = $state<GraphViewId>('diagram')
	using = $state<ChannelId>('color')
	/** Show the diagram's own controls, and its key. Both are opt-in on the components too. */
	controls = $state(true)
	legend = $state(true)

	get config() {
		return registry[this.diagram]
	}

	/** Whether the entity/entities views make sense for the active diagram. */
	get hasViews(): boolean {
		return this.config.views === true
	}

	select(id: DiagramId) {
		this.diagram = id
		// A view that the new diagram does not offer would leave the stage empty with no
		// visible reason, so the pick falls back rather than persisting.
		if (!this.hasViews) this.view = 'diagram'
	}
}

export const explorer = new GraphExplorerStore()
