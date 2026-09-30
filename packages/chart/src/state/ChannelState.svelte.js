import { distinct, isLiteralColor } from '../lib/brewing/colors.js'

/** The positional and aesthetic channels a container can inherit from its first geom. */
const INHERITED = ['x', 'y', 'color', 'fill', 'pattern', 'symbol']

/**
 * Which data field feeds each aesthetic, once the container and its geoms are merged.
 */
export class ChannelState {
	#config
	#geoms

	/**
	 * @param {import('./PlotConfig.svelte.js').PlotConfig} config
	 * @param {import('./GeomRegistry.svelte.js').GeomRegistry} geoms
	 */
	constructor(config, geoms) {
		this.#config = config
		this.#geoms = geoms
	}

	/**
	 * The container's channels, with each field it omits taken from the FIRST geom — per field,
	 * not all-or-nothing, so a `<Plot.Root x y>` that omits `color` still picks up
	 * `<Plot.Box color=x>`'s, and the palette gets per-category entries instead of grey.
	 */
	effective = $derived.by(() => {
		const tc = this.#config.channels
		const geom = this.#geoms.first
		if (!geom) return tc
		const own = geom.channels ?? {}
		return Object.fromEntries(INHERITED.map((key) => [key, tc[key] ?? own[key]]))
	})

	/** The colour field, or null when `color` is a literal CSS colour rather than a field. */
	colorField = $derived(isLiteralColor(this.effective.color) ? null : this.effective.color)
	/** The fill field, or null for a literal colour. */
	fillField = $derived(isLiteralColor(this.effective.fill) ? null : this.effective.fill)
	patternField = $derived(this.effective.pattern)
	symbolField = $derived(this.effective.symbol)

	/**
	 * The category values feeding ONE shared palette and legend: every `color` and `fill` field
	 * of the container and of every geom (literal colours excluded), their values unioned in
	 * order. See docs/backlog/2026-08-17-chart-aesthetics-unification.md §2.
	 *
	 * `includes` rather than a Set: a domain of dozens of categories, not rows, so the scan
	 * costs nothing and there is no collection for the reactivity linter to flag.
	 */
	colorValues = $derived.by(() => {
		const fields = []
		const add = (f) => {
			if (f && !isLiteralColor(f) && !fields.includes(f)) fields.push(f)
		}
		add(this.#config.channels.color)
		add(this.#config.channels.fill)
		for (const g of this.#geoms.list) {
			add(g.channels?.color)
			add(g.channels?.fill)
		}
		const values = []
		for (const f of fields) {
			for (const v of distinct(this.#config.data, f)) if (!values.includes(v)) values.push(v)
		}
		return values
	})
}
