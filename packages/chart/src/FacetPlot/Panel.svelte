<script lang="ts">
	import type { Snippet } from 'svelte'
	import PlotChart from '../Plot.svelte'
	import type { GeomSpec, PlotHelpers } from '../lib/plot/types.js'

	type Props = {
		data?: Record<string, unknown>[]
		x?: string
		y?: string
		color?: string
		geoms?: GeomSpec[]
		helpers?: PlotHelpers
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean
		legend?: boolean
		xDomain?: unknown[]
		yDomain?: [number, number]
		colorDomain?: unknown[]
		children?: Snippet
	}

	let {
		data = [],
		x,
		y,
		color,
		geoms = [],
		helpers = {},
		width,
		height,
		mode,
		grid,
		legend,
		xDomain,
		yDomain,
		colorDomain,
		children
	}: Props = $props()

	// Build spec with domain overrides so PlotState uses them
	const spec = $derived({
		data,
		x,
		y,
		color,
		geoms,
		xDomain,
		yDomain,
		colorDomain
	})
</script>

<PlotChart {spec} {helpers} {width} {height} {mode} {grid} {legend}>
	{@render children?.()}
</PlotChart>
