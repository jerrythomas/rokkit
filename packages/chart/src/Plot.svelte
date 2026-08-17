<script lang="ts">
	import { getContext } from 'svelte'
	import type { Snippet } from 'svelte'
	import { defaultPreset } from './lib/preset.js'
	import type { PlotSpec, PlotHelpers } from './lib/plot/types.js'
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
		animate = true,
		children
	}: Props = $props()

	const chartPresetCtx = getContext<ChartPresetCtx | undefined>('chart-preset')
	const chartPreset = $derived(chartPresetCtx?.current ?? defaultPreset)

	const gridValue = $derived(spec?.grid ?? grid)
	const showGrid = $derived(gridValue !== false)
	const gridLines = $derived(
		gridValue === true || gridValue === false ? 'auto' : gridValue
	)
	const showLegend = $derived(spec?.legend ?? legend)
	const chartTitle = $derived(spec?.title ?? title)
	const chartSummary = $derived(spec?.summary ?? summary)

	// Accessible data table — screen reader fallback
	const tableData = $derived(spec?.data ?? data)
	const tableColumns = $derived.by(() => {
		// Dedupe: a channel may repeat (e.g. x === color), and the table's keyed each
		// requires unique column names.
		const cols = [...new Set(
			[spec?.x, spec?.y, spec?.color ?? spec?.fill].filter((c): c is string => Boolean(c))
		)]
		if (cols.length > 0) return cols
		const first = tableData[0]
		return first ? Object.keys(first) : []
	})

	// Config for the shared PlotSurface (which owns PlotState, the responsive width, context,
	// animation, patterns, and zoom). `width` is the fallback — PlotSurface observes the container.
	function buildPlotConfig() {
		return {
			data: spec?.data ?? data,
			width: spec?.width ?? width,
			height: spec?.height ?? height,
			mode,
			margin,
			channels: spec ? { x: spec.x, y: spec.y, color: spec.color ?? spec.fill } : {},
			labels: spec?.labels ?? {},
			helpers,
			xDomain: spec?.xDomain,
			yDomain: spec?.yDomain,
			colorDomain: spec?.colorDomain,
			colorScale: spec?.colorScale,
			colorScheme: spec?.colorScheme,
			colorMidpoint: spec?.colorMidpoint,
			orientation: spec?.orientation,
			sort: spec?.sort,
			continuousCategory: spec?.continuousCategory,
			chartPreset,
			onselect,
			selectable
		}
	}

	// Geoms from spec (spec-driven API)
	const specGeoms = $derived(spec?.geoms ?? [])

	const overlayX = $derived(spec?.x ?? x)
	const overlayY = $derived(spec?.y ?? y)

	// Geom component resolver for spec-driven mode
	const GEOM_COMPONENTS = {
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
		ribbon: Ribbon
	}

	function resolveGeomComponent(type: string) {
		return helpers?.geoms?.[type] ?? GEOM_COMPONENTS[type as keyof typeof GEOM_COMPONENTS]
	}
</script>

<div class="plot-root">
	{#if chartTitle}
		<div class="plot-title" data-plot-title>{chartTitle}</div>
	{/if}

	<!-- The shared root shell (PlotState, responsive width, context, animation, patterns, zoom).
	     The batteries below (grid/axes/geoms/overlays) render inside its canvas via context. -->
	<PlotSurface
		config={buildPlotConfig()}
		{animate}
		{zoom}
		ariaLabel={chartTitle || 'Chart visualization'}
		summary={chartSummary}
		bind:selected
	>
		<!-- Grid (behind everything) -->
		{#if showGrid}
			<Grid lines={gridLines} {xTicks} {yTicks} />
		{/if}

		<!-- Declarative children (geom components) -->
		{@render children?.()}

		<!-- Spec-driven geoms -->
		{#each specGeoms as geomSpec (geomSpec.type)}
			{@const GeomComponent = resolveGeomComponent(geomSpec.type)}
			{#if GeomComponent}
				<GeomComponent
					x={geomSpec.x ?? spec?.x}
					y={geomSpec.y ?? spec?.y}
					color={geomSpec.color ?? spec?.color}
					fill={geomSpec.fill ?? spec?.fill}
					pattern={geomSpec.pattern}
					symbol={geomSpec.symbol}
					stat={geomSpec.stat}
					label={geomSpec.label}
					options={{
						...(spec?.stack !== undefined ? { stack: spec.stack } : {}),
						...(spec?.orientation !== undefined ? { orientation: spec.orientation } : {}),
						...(geomSpec.options ?? {})
					}}
				/>
			{/if}
		{/each}

		<!-- Axes -->
		{#if axes}
			<Axis type="x" label={spec?.labels?.[spec?.x ?? ''] ?? ''} format={xFormat} ticks={xTicks} {minorTicks} />
			<Axis type="y" label={spec?.labels?.[spec?.y ?? ''] ?? ''} format={yFormat} ticks={yTicks} {minorTicks} />
		{/if}

		{#if trend !== null && trend !== undefined}
			<Trend x={overlayX} y={overlayY} {trend} />
		{/if}

		{#if (highlight !== null && highlight !== undefined) || selectable || selected.length}
			<Highlight x={overlayX} y={overlayY} {highlight} {label} />
		{/if}

		<!-- HTML overlays — outside the svg but INSIDE the plot-state context. -->
		{#snippet overlay()}
			{#if showLegend}
				<Legend labels={spec?.labels ?? {}} />
			{/if}

			{#if tooltip}
				<Tooltip {tooltip} />
			{/if}

			{#if tableData.length > 0 && tableColumns.length > 0}
				<table class="plot-sr-table" aria-label={chartTitle || 'Chart data'}>
					{#if chartTitle}
						<caption>{chartTitle}</caption>
					{/if}
					<thead>
						<tr>
							{#each tableColumns as col (col)}
								<th scope="col">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each tableData as row, i (i)}
							<tr>
								{#each tableColumns as col (col)}
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
