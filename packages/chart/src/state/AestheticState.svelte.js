import { SvelteMap } from 'svelte/reactivity'
import { inferFieldType, inferColorScaleType } from '../lib/plot/scales.js'
import { distinct, assignColors, isLiteralColor, buildSequentialScale, buildDivergingScale } from '../lib/brewing/colors.js'
import { assignPatterns } from '../lib/brewing/patterns.js'
import { assignSymbols } from '../lib/brewing/marks/points.js'

/**
 * What each category looks like: its palette entry, pattern and symbol — and, for a numeric
 * colour field, the continuous (sequential or diverging) colour scale.
 */
export class AestheticState {
	#config
	#channels

	/**
	 * @param {import('./PlotConfig.svelte.js').PlotConfig} config
	 * @param {import('./ChannelState.svelte.js').ChannelState} channels
	 */
	constructor(config, channels) {
		this.#config = config
		this.#channels = channels
	}

	/** 'categorical' | 'sequential' | 'diverging' — inferred from the colour field and the spec. */
	colorScaleType = $derived.by(() => {
		const field = this.#channels.effective.color
		if (!field) return 'categorical'
		return inferColorScaleType(this.#config.data, field, {
			colorScale: this.#config.colorScale,
			colorMidpoint: this.#config.colorMidpoint
		})
	})

	/** The sequential or diverging colour scale, or null for a categorical colour field. */
	continuousColorScale = $derived.by(() => {
		const field = this.#channels.effective.color
		if (!field || this.colorScaleType === 'categorical') return null
		const opts = {
			colorScheme: this.#config.colorScheme,
			colorDomain: this.#config.colorDomain,
			colorMidpoint: this.#config.colorMidpoint
		}
		const build = this.colorScaleType === 'diverging' ? buildDivergingScale : buildSequentialScale
		return build(this.#config.data, field, opts)
	})

	/**
	 * Map<category, { fill, stroke }> — one shared palette across the colour and fill channels.
	 *
	 * A literal CSS colour is a singleton keyed by null, which every mark falls back to. A
	 * `colorDomain` (FacetPlot passes one so panels agree) wins over the local categories. With
	 * no colour field at all, a single series takes the first palette entry rather than grey.
	 */
	colors = $derived.by(() => {
		const field = this.#channels.effective.color
		if (isLiteralColor(field)) {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a derived value, rebuilt whole; nothing mutates it
			return new Map([[null, { fill: field, stroke: field }]])
		}
		const values = this.#config.colorDomain ?? this.#channels.colorValues
		const keys = values.length === 0 && this.#config.data.length > 0 ? [null] : values
		return assignColors(keys, this.#config.mode, this.#config.chartPreset)
	})

	/** Map<category, pattern name> — only for a categorical pattern field. */
	patterns = $derived.by(() => {
		const pf = this.#channels.effective.pattern
		if (!pf || inferFieldType(this.#config.data, pf) === 'continuous') return new SvelteMap()
		return assignPatterns(distinct(this.#config.data, pf))
	})

	/** Map<category, symbol shape>. */
	symbols = $derived.by(() => {
		const sf = this.#channels.effective.symbol
		if (!sf) return new SvelteMap()
		return assignSymbols(distinct(this.#config.data, sf), this.#config.chartPreset)
	})
}
