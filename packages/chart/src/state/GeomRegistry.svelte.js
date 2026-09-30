import { untrack } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'
import { applyGeomStat } from '../lib/plot/stat.js'

/** Module-wide so ids stay unique across every plot and spark on the page. */
let nextId = 0

/**
 * The geoms mounted in one plot, and the rows each one draws.
 *
 * Shared by `PlotState` and `SparkState`, which used to carry a copy each — and so needed the
 * undefined-channel fix below made twice. `source` is whatever owns the rows and the container
 * channels: `{ data, channels, helpers? }`, read live through its getters.
 */
export class GeomRegistry {
	#source
	#prefix
	#geoms = $state([])

	/**
	 * @param {{ data: Record<string, unknown>[], channels: Record<string, string | undefined>, helpers?: Record<string, unknown> }} source
	 * @param {string} [prefix] - id prefix, so a plot's geom ids and a spark's never collide
	 */
	constructor(source, prefix = 'geom') {
		this.#source = source
		this.#prefix = prefix
	}

	/** Every mounted geom's config, in mount order. */
	get list() {
		return this.#geoms
	}
	/** The first mounted geom — the one a container without channels borrows them from. */
	get first() {
		return this.#geoms[0]
	}
	/** Distinct geom types mounted (the legend picks a swatch style from these). */
	types = $derived(new SvelteSet(this.#geoms.map((g) => g.type)))

	/** @param {(g: any) => boolean} predicate */
	find(predicate) {
		return this.#geoms.find(predicate)
	}

	/** Called once per geom from its onMount; the returned id is its handle. */
	register(config) {
		const id = `${this.#prefix}-${nextId++}`
		this.#geoms = [...this.#geoms, { id, ...config }]
		return id
	}

	/**
	 * Called from a geom's `$effect`. The read of the list is untracked: tracked, the effect
	 * would re-run on its own write (effect_update_depth_exceeded).
	 */
	update(id, config) {
		this.#geoms = untrack(() => this.#geoms).map((g) => (g.id === id ? { ...g, ...config } : g))
	}

	/** Called from a geom's onDestroy, which Svelte runs outside any tracking scope. */
	unregister(id) {
		this.#geoms = this.#geoms.filter((g) => g.id !== id)
	}

	/**
	 * The rows one geom draws.
	 *
	 * Identity stat returns the source rows THEMSELVES, not a copy: geoms look a row up with
	 * `plotState.data.indexOf(row)`, which only matches the same object.
	 */
	data(id) {
		const geom = this.#geoms.find((g) => g.id === id)
		if (!geom) return []
		const stat = geom.stat ?? 'identity'
		const rows = this.#source.data
		if (stat === 'identity') return rows
		// A geom that omits a channel to inherit it from the container sends
		// `{ x: undefined }`, not `{}`. Spread as-is, that own `undefined` would clobber the
		// container's value and the stat would silently fall back to identity.
		const geomChannels = Object.fromEntries(
			Object.entries(geom.channels ?? {}).filter(([, v]) => v !== undefined)
		)
		const channels = { ...this.#source.channels, ...geomChannels }
		return applyGeomStat(rows, { stat, channels }, this.#source.helpers)
	}
}
