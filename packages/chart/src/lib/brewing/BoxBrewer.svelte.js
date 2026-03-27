import { QuartileBrewer } from './QuartileBrewer.svelte.js'
import { buildBoxes } from './marks/boxes.js'

/**
 * Brewer for box plots.
 * fill = box interior color, color = whisker/outline stroke.
 */
export class BoxBrewer extends QuartileBrewer {
	boxes = $derived(
		this.xScale && this.yScale
			? buildBoxes(this.processedData, this.channels, this.xScale, this.yScale, this.colorMap)
			: []
	)
}
