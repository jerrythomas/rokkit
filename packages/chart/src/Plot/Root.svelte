<script lang="ts">
	import type { Snippet } from 'svelte'
	import { defaultPreset } from '../lib/preset.js'
	import PlotSurface from '../PlotSurface.svelte'

	type Margin = { top?: number; right?: number; bottom?: number; left?: number }
	type Row = Record<string, unknown>

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		color?: string
		/** Interior aesthetic default (field); geoms inherit unless they set their own. */
		fill?: string
		width?: number
		height?: number
		margin?: Margin
		mode?: 'light' | 'dark'
		/** Chart direction. 'horizontal' stands the category axis up and runs the value
		 *  axis sideways — x/y channels are unchanged. `flip` is sugar for 'horizontal'. */
		orientation?: 'vertical' | 'horizontal'
		flip?: boolean
		/** Order the category (band) axis by aggregated value instead of by label — bars sorted
		 *  by size (histogram-style). 'desc' (largest first) | 'asc'. */
		sort?: 'asc' | 'desc'
		/** Explicit scale domain overrides. */
		xDomain?: unknown[]
		yDomain?: unknown[]
		/** Continuous colour scale controls (sequential/diverging). */
		colorScale?: unknown
		colorScheme?: string
		colorDomain?: unknown[]
		colorMidpoint?: number
		/** Enable d3-zoom pan/zoom. */
		zoom?: boolean
		/** Opt-in click-to-select; fires onselect(detail) and syncs bind:selected (row refs). */
		selectable?: boolean
		onselect?: (detail: unknown) => void
		selected?: Row[]
		/** Animate marks on data/flip changes. Enabled one frame after mount so the
		 *  initial layout paints un-animated. Default `true`. */
		animate?: boolean
		children?: Snippet
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		fill = undefined,
		width = 600,
		height = 400,
		margin = undefined,
		mode = undefined,
		orientation = undefined,
		flip = false,
		sort = undefined,
		xDomain = undefined,
		yDomain = undefined,
		colorScale = undefined,
		colorScheme = undefined,
		colorDomain = undefined,
		colorMidpoint = undefined,
		zoom = false,
		selectable = false,
		onselect = undefined,
		selected = $bindable([]),
		animate = true,
		children
	}: Props = $props()

	// The composable root is just PlotSurface (the shared shell) fed a config from these props.
	const config = $derived({
		data,
		channels: { x, y, color, fill },
		width,
		height,
		margin,
		mode,
		orientation: flip ? 'horizontal' : orientation,
		sort,
		xDomain,
		yDomain,
		colorScale,
		colorScheme,
		colorDomain,
		colorMidpoint,
		onselect,
		selectable,
		chartPreset: defaultPreset
	})
</script>

<PlotSurface {config} {animate} {zoom} bind:selected>
	{@render children?.()}
</PlotSurface>
