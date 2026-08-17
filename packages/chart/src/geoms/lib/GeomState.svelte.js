/**
 * Per-geom reactive state, fed by the shared `PlotState` context. Owns the geom's
 * registration lifecycle and derives the renderable `marks` array, so a geom component
 * only has to render marks + wire interactivity. This is the integrated version of the
 * old brewer idea — one shared path, not a parallel one.
 * See docs/backlog/2026-08-17-chart-aesthetics-unification.md §11.
 *
 * @typedef {Object} GeomConfig
 * @property {string} type
 * @property {Record<string, string | undefined>} channels
 * @property {string} [stat]
 * @property {Record<string, unknown>} [options]
 * @property {number} [alpha]
 * @property {(ctx: { data: any[], plot: any, channels: any, options: any, alpha: number|undefined, type: string }) => any} build
 */
export class GeomState {
	#plot
	#config
	#id = $state(null)

	/**
	 * @param {any} plot - the PlotState from context
	 * @param {() => GeomConfig} config - a getter thunk (Svelte passes reactive values to
	 *   classes via getters), read reactively on every marks recompute.
	 */
	constructor(plot, config) {
		this.#plot = plot
		this.#config = config
	}

	// Arrow methods so they can be passed straight to onMount/onDestroy/$effect without
	// losing `this` (see Svelte $state "Classes" docs).
	register = () => {
		const c = this.#config()
		this.#id = this.#plot.registerGeom({
			type: c.type,
			channels: c.channels,
			stat: c.stat ?? 'identity',
			options: c.options ?? {}
		})
	}

	sync = () => {
		if (this.#id === null) return
		const c = this.#config()
		this.#plot.updateGeom(this.#id, {
			channels: c.channels,
			stat: c.stat ?? 'identity',
			options: c.options ?? {}
		})
	}

	destroy = () => {
		if (this.#id !== null) this.#plot.unregisterGeom(this.#id)
	}

	#data = $derived(this.#id !== null ? this.#plot.geomData(this.#id) : [])

	// The geom's rows (post-stat). Exposed for templates that render per-row overlays
	// (e.g. an area's invisible tooltip hit-circles) alongside the computed `marks`.
	get data() {
		return this.#data
	}

	// The renderable array. `build` reads scales/colors/preset from `plot` synchronously,
	// so those reads register as dependencies and `marks` recomputes on any change.
	marks = $derived.by(() => {
		const c = this.#config()
		if (!this.#data.length) return []
		return c.build({
			data: this.#data,
			plot: this.#plot,
			channels: c.channels,
			options: c.options ?? {},
			alpha: c.alpha,
			type: c.type
		})
	})
}
