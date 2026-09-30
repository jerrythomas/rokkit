<script lang="ts">
	import { getContext } from 'svelte'
	import type { Snippet } from 'svelte'
	import { defaultPreset } from './lib/preset.js'
	import type { PlotSpec, PlotHelpers } from './lib/plot/types.js'
	import { resolvePlotConfig, resolveChrome, tableColumns } from './lib/plot/spec.js'
	import PlotSurface from './PlotSurface.svelte'
	import Axis from './Plot/Axis.svelte'
	import Grid from './Plot/Grid.svelte'
	import Legend from './Plot/Legend.svelte'
	import Tooltip from './Plot/Tooltip.svelte'
	import SpecGeoms from './Plot/SpecGeoms.svelte'
	import DataTable from './Plot/DataTable.svelte'
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

		<!-- Spec-driven geoms -->
		<SpecGeoms {spec} {helpers} />

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

			<DataTable rows={tableData} {columns} title={chrome.title} />
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
</style>
