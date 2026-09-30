import { inferFieldType, inferOrientation } from '../lib/plot/scales.js'

/** Geoms that band the x channel even when it is numeric (a year, a week, a race rank). */
export const CATEGORICAL_X = Object.freeze(['bar', 'box', 'violin', 'jitter'])

/**
 * Which way the chart reads, and how abstract (x-channel, y-channel) positions map to screen.
 *
 * Only a category-on-x chart flips: horizontal stands the band axis up the screen and lays the
 * value axis along it, with the x/y channels unchanged. A plain scatter has no band, so
 * `orientation` is a no-op for it.
 */
export class OrientationState {
	#config
	#channels
	#geoms

	/**
	 * @param {import('./PlotConfig.svelte.js').PlotConfig} config
	 * @param {import('./ChannelState.svelte.js').ChannelState} channels
	 * @param {import('./GeomRegistry.svelte.js').GeomRegistry} geoms
	 */
	constructor(config, channels, geoms) {
		this.#config = config
		this.#channels = channels
		this.#geoms = geoms
	}

	/** A mounted geom bands the x channel. */
	hasBandGeom = $derived(this.#geoms.list.some((g) => CATEGORICAL_X.includes(g.type)))

	/**
	 * Field types of the effective x and y, with x forced to `band` when a banding geom sits on
	 * a continuous x/y pair. Null until both channels exist. Computed once for orientation and
	 * `bandIsX` both — they used to infer the same types twice.
	 */
	#types = $derived.by(() => {
		const { x, y } = this.#channels.effective
		if (!x || !y) return null
		const rawX = inferFieldType(this.#config.data, x)
		const yType = inferFieldType(this.#config.data, y)
		const xType =
			this.hasBandGeom && rawX === 'continuous' && yType === 'continuous' ? 'band' : rawX
		return { xType, yType }
	})

	/** The caller's override, else inferred: 'vertical' | 'horizontal' | 'none'. */
	orientation = $derived(
		this.#config.orientation ??
			(this.#types ? inferOrientation(this.#types.xType, this.#types.yType) : 'none')
	)
	/** The x channel is the categorical (band) axis. */
	bandIsX = $derived(this.#types?.xType === 'band')
	/** Rendered horizontally: the band axis stands up the screen. */
	flipped = $derived(this.orientation === 'horizontal' && this.bandIsX)

	/**
	 * Abstract (x-channel, y-channel) scale outputs to screen coordinates. Geoms compute
	 * `u = xScale(d[x])`, `v = yScale(d[y])`, then place them.
	 */
	place(u, v) {
		return this.flipped ? { x: v, y: u } : { x: u, y: v }
	}
}
