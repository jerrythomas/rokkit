<script>
	import { setContext, getContext, untrack } from 'svelte'
	import { zoom as d3Zoom } from 'd3-zoom'
	import { select } from 'd3-selection'
	import { PlotState } from './PlotState.svelte.js'
	import { defaultPreset } from './lib/preset.js'
	import Axis from './Plot/Axis.svelte'
	import Grid from './Plot/Grid.svelte'
	import Legend from './Plot/Legend.svelte'
	import Tooltip from './Plot/Tooltip.svelte'
	import DefinePatterns from './patterns/DefinePatterns.svelte'
	import Bar from './geoms/Bar.svelte'
	import Line from './geoms/Line.svelte'
	import Area from './geoms/Area.svelte'
	import Point from './geoms/Point.svelte'
	import Arc from './geoms/Arc.svelte'
	import Box from './geoms/Box.svelte'
	import Violin from './geoms/Violin.svelte'

	/**
	 * @type {{
	 *   data?: Object[],
	 *   spec?: import('./lib/plot/types.js').PlotSpec,
	 *   helpers?: import('./lib/plot/types.js').PlotHelpers,
	 *   width?: number,
	 *   height?: number,
	 *   mode?: 'light' | 'dark',
	 *   grid?: boolean,
	 *   axes?: boolean,
	 *   margin?: { top: number, right: number, bottom: number, left: number },
	 *   legend?: boolean,
	 *   title?: string,
	 *   summary?: string,
	 *   tooltip?: boolean | ((data: Record<string, unknown>) => string),
	 *   zoom?: boolean,
	 *   children?: import('svelte').Snippet,
	 * }}
	 */
	let {
		data = [],
		spec = undefined,
		helpers = {},
		width = 600,
		height = 400,
		mode = 'light',
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
		children
	} = $props()

	const chartPresetCtx = getContext('chart-preset')
	const chartPreset = $derived(chartPresetCtx?.current ?? defaultPreset)

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
			orientation: spec?.orientation,
			chartPreset
		}
	}

	// Create PlotState with initial values and provide as context.
	// untrack() suppresses "captures initial value" warnings — intentional:
	// the $effect below handles all subsequent reactive updates.
	const plotState = untrack(() => new PlotState(buildPlotConfig()))
	setContext('plot-state', plotState)

	// Keep state in sync when reactive config changes
	$effect(() => {
		plotState.update(buildPlotConfig())
	})

	let svgEl = $state(null)

	$effect(() => {
		if (!zoom || !svgEl) return
		const zoomBehavior = d3Zoom()
			.scaleExtent([1, 8])
			.on('zoom', (event) => {
				plotState.applyZoom(event.transform)
			})
		const sel = select(svgEl)
		sel.call(zoomBehavior)
		return () => {
			sel.on('.zoom', null)
			plotState.resetZoom()
		}
	})

	const svgWidth = $derived(spec?.width ?? width)
	const svgHeight = $derived(spec?.height ?? height)
	const showGrid = $derived(spec?.grid ?? grid)
	const showLegend = $derived(spec?.legend ?? legend)
	const chartTitle = $derived(spec?.title ?? title)
	const chartSummary = $derived(spec?.summary ?? summary)

	// Geoms from spec (spec-driven API)
	const specGeoms = $derived(spec?.geoms ?? [])

	// Geom component resolver for spec-driven mode
	const GEOM_COMPONENTS = {
		bar: Bar,
		line: Line,
		area: Area,
		point: Point,
		arc: Arc,
		box: Box,
		violin: Violin
	}

	/**
	 * @param {string} type
	 */
	function resolveGeomComponent(type) {
		return helpers?.geoms?.[type] ?? GEOM_COMPONENTS[type]
	}
</script>

<div class="plot-root" data-plot-root data-mode={mode}>
	{#if chartTitle}
		<div class="plot-title" data-plot-title>{chartTitle}</div>
	{/if}

	<svg
		bind:this={svgEl}
		width={svgWidth}
		height={svgHeight}
		viewBox="0 0 {svgWidth} {svgHeight}"
		role="img"
		aria-label={chartTitle || 'Chart visualization'}
		style:cursor={zoom ? 'grab' : undefined}
	>
		<!-- SVG pattern defs -->
		<DefinePatterns />

		<g
			class="plot-canvas"
			transform="translate({plotState.margin.left}, {plotState.margin.top})"
			data-plot-canvas
		>
			<!-- Grid (behind everything) -->
			{#if showGrid}
				<Grid />
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
						options={geomSpec.options}
					/>
				{/if}
			{/each}

			<!-- Axes -->
			{#if axes}
				<Axis type="x" label={spec?.labels?.[spec?.x ?? ''] ?? ''} format={xFormat} />
				<Axis type="y" label={spec?.labels?.[spec?.y ?? ''] ?? ''} format={yFormat} />
			{/if}
		</g>
	</svg>

	<!-- Legend (HTML, outside SVG) -->
	{#if showLegend}
		<Legend labels={spec?.labels ?? {}} />
	{/if}

	<!-- Tooltip (HTML, fixed-position overlay) -->
	{#if tooltip}
		<Tooltip {tooltip} />
	{/if}
</div>

<style>
	.plot-root {
		position: relative;
		width: 100%;
		height: auto;
	}

	[data-plot-root][data-mode='light'] {
		color: #475569; /* slate-600 */
	}

	[data-plot-root][data-mode='dark'] {
		color: #94a3b8; /* slate-400 */
	}

	svg {
		display: block;
		overflow: visible;
	}

	.plot-canvas {
		pointer-events: all;
	}

	.plot-title {
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		margin-bottom: 4px;
	}
</style>
