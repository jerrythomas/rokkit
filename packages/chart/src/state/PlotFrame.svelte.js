import { DEFAULT_MARGIN } from './PlotConfig.svelte.js'

/**
 * The drawing area: the plot's size less its margin. Every scale's range comes from here.
 */
export class PlotFrame {
	#config

	/** @param {import('./PlotConfig.svelte.js').PlotConfig} config */
	constructor(config) {
		this.#config = config
	}

	/** The caller's margin override, else the default. */
	margin = $derived(this.#config.margin ?? DEFAULT_MARGIN)
	innerWidth = $derived(this.#config.width - this.margin.left - this.margin.right)
	innerHeight = $derived(this.#config.height - this.margin.top - this.margin.bottom)
}
