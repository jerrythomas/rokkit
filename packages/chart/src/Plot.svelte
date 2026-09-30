<script lang="ts">
	import { getContext } from 'svelte'
	import type { Component, Snippet } from 'svelte'
	import { defaultPreset } from './lib/preset.js'
	import type { PlotSpec, PlotHelpers } from './lib/plot/types.js'
	import { resolvePlotConfig, resolveChrome, tableColumns, specGeomProps } from './lib/plot/spec.js'
	import PlotSurface from './PlotSurface.svelte'
	import Axis from './Plot/Axis.svelte'
	import Grid from './Plot/Grid.svelte'
	import Legend from './Plot/Legend.svelte'
	import Tooltip from './Plot/Tooltip.svelte'
	import Bar from './geoms/Bar.svelte'
	import Line from './geoms/Line.svelte'
	import Area from './geoms/Area.svelte'
	import Point from './geoms/Point.svelte'
	import Arc from './geoms/Arc.svelte'
	import Box from './geoms/Box.svelte'
	import Violin from './geoms/Violin.svelte'
	import Heatmap from './geoms/Heatmap.svelte'
	import Candlestick from './geoms/Candlestick.svelte'
	import Waterfall from './geoms/Waterfall.svelte'
	import Hexbin from './geoms/Hexbin.svelte'
	import Ribbon from './geoms/Ribbon.svelte'
	import Radar from './geoms/Radar.svelte'
	import Rule from './geoms/Rule.svelte'
	import Region from './geoms/Region.svelte'
	import Hull from './geoms/Hull.svelte'
	import Contour from './geoms/Contour.svelte'
	import Highlight from './geoms/Highlight.svelte'
	import Trend from './geoms/Trend.svelte'

	type Row = Record<string, unknown>
	type Method = string | number | { type: string; [k: string]: unknown }
	type Margin = { top: number; right: number; bottom: number; left: number }
	type ChartPresetCtx = { current: typeof defaultPreset }

	type Props = {
		data?: Row[]
		spec?: PlotSpec
		helpers?: PlotHelpers
		width?: number
		height?: number
		mode?: 'light' | 'dark'
		grid?: boolean | 'x' | 'y' | 'both'
		axes?: boolean
		margin?: Margin
		legend?: boolean
		title?: string
		summary?: string
		tooltip?: boolean | ((data: Row) => string)
		zoom?: boolean
		/** Force chart direction (else inferred). Also settable via `spec.orientation`. */
		orientation?: 'horizontal' | 'vertical'
		xFormat?: (v: unknown) => string
		yFormat?: (v: unknown) => string
		xTicks?: number
		yTicks?: number
		minorTicks?: boolean
		x?: string
		y?: string
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		label?: boolean | string | ((row: Row) => unknown)
		trend?: Method | Method[]
		onselect?: (detail: unknown) => void
		selectable?: boolean
		selected?: Row[]
		/** Data-coordinate crossing point of the axes: `[xCross, yCross]`. Drives
		 *  quadrant mode — where the origin sits relative to the domain makes a chart
		 *  1- / 2- / 4-quadrant. Omit a component to leave that axis auto (crosses at 0
		 *  when the domain spans it, else edge-pinned). Also settable via `spec.axisOrigin`. */
		axisOrigin?: [number | undefined, number | undefined]
		/** Nudge an edge-pinned axis outward by N px (Q1 only). Also via `spec.axisOffset`. */
		axisOffset?: number
		/** Fix the x domain instead of inferring it from the data — e.g. `[0, 1]` for a metric
		 *  plane defined by theory, not by where the rows fall. Also via `spec.xDomain`. */
		xDomain?: unknown[]
		/** Fix the y domain. Also via `spec.yDomain`. */
		yDomain?: unknown[]
		/** Animate marks on data/flip changes (opt-out for e.g. AnimatedPlot, which
		 *  tweens its own frames). Enabled one frame after the width settles so the
		 *  initial layout paints un-animated. Default `true`. */
		animate?: boolean
		children?: Snippet
	}

	let {
		data = [],
		spec = undefined,
		helpers = {},
		width = 600,
		height = 400,
		mode = undefined,
		grid = true,
		axes = true,
		margin = undefined,
		legend = false,
		title = '',
		summary = '',
		tooltip = false,
		zoom = false,
		orientation = undefined,
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false,
		x = undefined,
		y = undefined,
		highlight = undefined,
		label = false,
		trend = undefined,
		onselect = undefined,
		selectable = false,
		selected = $bindable([]),
		axisOrigin = undefined,
		axisOffset = undefined,
		xDomain = undefined,
		yDomain = undefined,
		animate = true,
		children
	}: Props = $props()

	const chartPresetCtx = getContext<ChartPresetCtx | undefined>('chart-preset')
	const chartPreset = $derived(chartPresetCtx?.current ?? defaultPreset)

	// Spec-over-prop precedence lives in lib/plot/spec.js — one table, not a `??` per field.
	const chrome = $derived(
		resolveChrome(spec, { grid, legend, title, summary, x, y })
	)

	// Accessible data table — screen reader fallback
	const tableData = $derived(spec?.data ?? data)
	const columns = $derived(tableColumns(spec, tableData))

	// Config for the shared PlotSurface (which owns PlotState, the responsive width, context,
	// animation, patterns, and zoom). `width` is the fallback — PlotSurface observes the container.
	function buildPlotConfig() {
		return resolvePlotConfig(
			spec,
			{
				data,
				width,
				height,
				mode,
				margin,
				helpers,
				xDomain,
				yDomain,
				orientation,
				axisOrigin,
				axisOffset,
				onselect,
				selectable
			},
			chartPreset
		)
	}

	// Geoms from spec (spec-driven API)
	const specGeoms = $derived(spec?.geoms ?? [])

	// Geom component resolver for spec-driven mode. Typed as a lookup table, not the union of
	// its members: a spec names geoms by string at runtime, exactly like `helpers.geoms`, and the
	// union of every geom's Props has no single shape a generic call site can satisfy.
	// `any` is the honest type for a heterogeneous table resolved by name — the same one the
	// public `PlotHelpers.geoms` already declares in lib/plot/types.js.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const GEOM_COMPONENTS: Record<string, Component<any>> = {
		bar: Bar,
		line: Line,
		area: Area,
		point: Point,
		arc: Arc,
		box: Box,
		violin: Violin,
		heatmap: Heatmap,
		candlestick: Candlestick,
		waterfall: Waterfall,
		hexbin: Hexbin,
		ribbon: Ribbon,
		// Radar reads the generic x/y/color this path passes via its own aliases, and takes
		// its axis order from `options.axes` — see Radar.svelte's Props.
		radar: Radar,
		hull: Hull,
		contour: Contour
	}

	// Plane annotations read no data, so they take ONLY their own `props` — never the spec's
	// field channels: a Region's `x`/`y` are ranges, and handing it the field name 'instability'
	// would be a range of one string.
	const ANNOTATIONS = { rule: Rule, region: Region }

	function resolveGeomComponent(type: string) {
		return helpers?.geoms?.[type] ?? GEOM_COMPONENTS[type]
	}
</script>

<div class="plot-root">
	{#if chrome.title}
		<div class="plot-title" data-plot-title>{chrome.title}</div>
	{/if}

	<!-- The shared root shell (PlotState, responsive width, context, animation, patterns, zoom).
	     The batteries below (grid/axes/geoms/overlays) render inside its canvas via context. -->
	<PlotSurface
		config={buildPlotConfig()}
		{animate}
		{zoom}
		ariaLabel={chrome.title || 'Chart visualization'}
		summary={chrome.summary}
		bind:selected
	>
		<!-- Grid (behind everything) -->
		{#if chrome.showGrid}
			<Grid lines={chrome.gridLines} {xTicks} {yTicks} />
		{/if}

		<!-- Declarative children (geom components) -->
		{@render children?.()}

		<!-- Spec-driven geoms. Keyed by position, not type: two regions in one spec are normal, and
		     a type key would be a duplicate that aborts the whole render. -->
		{#each specGeoms as geomSpec, i (`${geomSpec.type}-${i}`)}
			{@const Annotation = ANNOTATIONS[geomSpec.type as keyof typeof ANNOTATIONS]}
			{@const GeomComponent = resolveGeomComponent(geomSpec.type)}
			{#if Annotation && !helpers?.geoms?.[geomSpec.type]}
				<Annotation {...geomSpec.props ?? {}} />
			{:else if GeomComponent}
				<GeomComponent {...specGeomProps(geomSpec, spec)} />
			{/if}
		{/each}

		<!-- Axes -->
		{#if axes}
			<Axis
				type="x"
				label={chrome.xLabel}
				format={xFormat}
				ticks={xTicks}
				{minorTicks}
			/>
			<Axis
				type="y"
				label={chrome.yLabel}
				format={yFormat}
				ticks={yTicks}
				{minorTicks}
			/>
		{/if}

		{#if trend !== null && trend !== undefined}
			<Trend x={chrome.overlayX} y={chrome.overlayY} {trend} />
		{/if}

		{#if (highlight !== null && highlight !== undefined) || selectable || selected.length}
			<Highlight x={chrome.overlayX} y={chrome.overlayY} {highlight} {label} />
		{/if}

		<!-- HTML overlays — outside the svg but INSIDE the plot-state context. -->
		{#snippet overlay()}
			{#if chrome.showLegend}
				<Legend labels={spec?.labels ?? {}} />
			{/if}

			{#if tooltip}
				<Tooltip {tooltip} />
			{/if}

			{#if tableData.length > 0 && columns.length > 0}
				<table class="plot-sr-table" aria-label={chrome.title || 'Chart data'}>
					{#if chrome.title}
						<caption>{chrome.title}</caption>
					{/if}
					<thead>
						<tr>
							{#each columns as col (col)}
								<th scope="col">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each tableData as row, i (i)}
							<tr>
								{#each columns as col (col)}
									<td>{row[col] ?? ''}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		{/snippet}
	</PlotSurface>
</div>

<style>
	.plot-root {
		position: relative;
		width: 100%;
		height: auto;
	}

	.plot-title {
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		margin-bottom: 4px;
	}

	/* Visually hidden — in DOM for screen readers, not visible */
	.plot-sr-table {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
