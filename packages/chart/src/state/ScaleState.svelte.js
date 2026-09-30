import { buildUnifiedXScale, buildUnifiedYScale } from '../lib/plot/scales.js'
import { sortedBandDomain, resolveValueDomain } from '../lib/plot/domains.js'

/**
 * The x and y position scales.
 *
 * Domains come, in order, from: the caller's override; for the value axis, the geometry of the
 * mounted geoms (`resolveValueDomain` — box whiskers, stacked totals, running totals); then the
 * extent of every geom's rows. Ranges come from the frame, oriented by the flip.
 */
export class ScaleState {
	#config
	#geoms
	#channels
	#orientation
	#frame
	#interaction

	/**
	 * @param {{
	 *   config: import('./PlotConfig.svelte.js').PlotConfig,
	 *   geoms: import('./GeomRegistry.svelte.js').GeomRegistry,
	 *   channels: import('./ChannelState.svelte.js').ChannelState,
	 *   orientation: import('./OrientationState.svelte.js').OrientationState,
	 *   frame: import('./PlotFrame.svelte.js').PlotFrame,
	 *   interaction: import('./InteractionState.svelte.js').InteractionState
	 * }} parts
	 */
	constructor({ config, geoms, channels, orientation, frame, interaction }) {
		this.#config = config
		this.#geoms = geoms
		this.#channels = channels
		this.#orientation = orientation
		this.#frame = frame
		this.#interaction = interaction
	}

	/** Every geom's rows (post-stat) — or the raw data before any geom mounts. Shared by both axes. */
	#datasets = $derived(
		this.#geoms.list.length > 0
			? this.#geoms.list.map((g) => this.#geoms.data(g.id))
			: [this.#config.data]
	)

	/**
	 * x is a band when a banding geom is mounted — except a CONTINUOUS category axis (a bar
	 * race's tweened rank), which stays linear so fractional positions tween.
	 */
	#bandX = $derived(
		this.#orientation.hasBandGeom &&
			!this.#config.continuousCategory &&
			(this.#orientation.orientation !== 'horizontal' || this.#orientation.flipped)
	)

	/** The caller's x domain, else — on a band axis — categories sorted by value when asked. */
	#xDomain = $derived(
		this.#config.xDomain ??
			(this.#bandX
				? sortedBandDomain(this.#datasets, this.#channels.effective.x, this.#channels.effective.y, this.#config.sort)
				: null) ??
			undefined
	)

	/** The x (category, when banded) scale. Includes zero only when x is the VALUE axis. */
	x = $derived.by(() => {
		const field = this.#channels.effective.x
		if (!field) return null
		const { orientation, flipped } = this.#orientation
		const base = buildUnifiedXScale(this.#datasets, field, this.#frame.innerWidth, {
			domain: this.#xDomain,
			includeZero: orientation === 'horizontal' && !flipped,
			band: this.#bandX,
			// Flipped: the category axis stands up the screen.
			range: flipped ? [this.#frame.innerHeight, 0] : undefined,
			// A continuous category axis is deliberately padded — do not nice() it to whole numbers.
			nice: !this.#config.continuousCategory
		})
		// A band cannot be zoomed; a continuous axis rescales through the transform.
		return typeof base?.bandwidth === 'function' ? base : this.#zoomed(base, 'rescaleX')
	})

	/** The y (value) scale — a zero baseline whenever it is the value axis. */
	y = $derived.by(() => {
		const field = this.#channels.effective.y
		if (!field) return null
		const { orientation, flipped } = this.#orientation
		const geomDomain = resolveValueDomain(
			this.#geoms.list,
			(id) => this.#geoms.data(id),
			this.#channels.effective,
			field
		)
		const base = buildUnifiedYScale(this.#datasets, field, this.#frame.innerHeight, {
			domain: this.#config.yDomain ?? geomDomain ?? undefined,
			includeZero: orientation === 'vertical' || flipped,
			// Flipped: the value axis runs along the screen.
			range: flipped ? [0, this.#frame.innerWidth] : undefined
		})
		return this.#zoomed(base, 'rescaleY')
	})

	/** @param {any} base @param {'rescaleX' | 'rescaleY'} method */
	#zoomed(base, method) {
		const zoom = this.#interaction.zoom
		return zoom ? zoom[method](base) : base
	}

	/** The categorical scale, whichever screen axis it is on. */
	get band() {
		return this.#orientation.bandIsX ? this.x : this.y
	}
	/** The continuous (value) scale, whichever screen axis it is on. */
	get value() {
		return this.#orientation.bandIsX ? this.y : this.x
	}
}
