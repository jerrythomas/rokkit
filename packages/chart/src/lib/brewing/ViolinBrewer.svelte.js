import { QuartileBrewer } from './QuartileBrewer.svelte.js'
import { buildViolins } from './marks/violins.js'

/**
 * Brewer for violin plots.
 * fill = violin body color, color = outline stroke.
 */
export class ViolinBrewer extends QuartileBrewer {
	violins = $derived(
		this.xScale && this.yScale
			? buildViolins(this.processedData, this.channels, this.xScale, this.yScale, this.colorMap)
			: []
	)
}
