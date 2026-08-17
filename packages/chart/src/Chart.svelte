<script lang="ts">
	import type { Snippet } from 'svelte'
	import Plot from './Plot.svelte'
	import type { ChartSpec } from './spec/chart-spec.js'
	import type { PlotSpec, GeomSpec } from './lib/plot/types.js'

	type Props = {
		spec?: ChartSpec
		data?: Record<string, unknown>[]
		x?: string
		y?: string
		color?: string
		pattern?: string
		fill?: string
		size?: string
		label?: string
		symbol?: string
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		children?: Snippet
	}

	let {
		spec = undefined,
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		pattern = undefined,
		fill = undefined,
		size = undefined,
		label = undefined,
		symbol = undefined,
		width = 600,
		height = 400,
		mode = undefined,
		children
	}: Props = $props()

	// `Chart` is a thin wrapper over the geom-path host (`Plot`). It maps the fluent
	// `ChartSpec` builder (data / channels / layers / options) onto a `PlotSpec` and renders
	// the layers as geoms. Axes/grid stay off by default — `Chart` historically rendered just
	// the marks (plus any declarative geom children). See the brewer-consolidation spec
	// (docs/backlog/2026-08-17-chart-aesthetics-unification.md §9).
	const plotSpec = $derived.by((): PlotSpec => {
		if (spec) {
			const ch = (spec.channels ?? {}) as {
				x?: string
				y?: string
				color?: string
				pattern?: string
			}
			const opts = (spec.options ?? {}) as {
				width?: number
				height?: number
				grid?: unknown
				legend?: unknown
			}
			const layers = (spec.layers ?? []) as GeomSpec[]
			return {
				data: spec.data as Record<string, unknown>[],
				x: ch.x,
				y: ch.y,
				color: ch.color,
				pattern: ch.pattern,
				width: opts.width ?? width,
				height: opts.height ?? height,
				grid: 'grid' in opts,
				legend: 'legend' in opts,
				geoms: layers.map((l) => ({ pattern: ch.pattern, ...l }))
			}
		}
		return {
			data,
			x,
			y,
			color: color ?? fill,
			pattern,
			size,
			symbol,
			width,
			height,
			grid: false,
			legend: false,
			geoms: []
		}
	})
</script>

<Plot spec={plotSpec} axes={false} label={label ?? false} {mode}>
	{@render children?.()}
</Plot>
