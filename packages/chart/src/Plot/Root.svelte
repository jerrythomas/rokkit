<script lang="ts">
	import type { Snippet } from 'svelte'
	import { defaultPreset } from '../lib/preset.js'
	import PlotSurface from '../PlotSurface.svelte'

	type Margin = { top?: number; right?: number; bottom?: number; left?: number }

	type Props = {
		data?: Record<string, unknown>[]
		x?: string
		y?: string
		color?: string
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
		width = 600,
		height = 400,
		margin = undefined,
		mode = undefined,
		orientation = undefined,
		flip = false,
		sort = undefined,
		animate = true,
		children
	}: Props = $props()

	// The composable root is just PlotSurface (the shared shell) fed a config from these props.
	const config = $derived({
		data,
		channels: { x, y, color },
		width,
		height,
		margin,
		mode,
		orientation: flip ? 'horizontal' : orientation,
		sort,
		chartPreset: defaultPreset
	})
</script>

<PlotSurface {config} {animate}>
	{@render children?.()}
</PlotSurface>
