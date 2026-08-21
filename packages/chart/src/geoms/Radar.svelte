<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildRadarMarks } from './lib/marks/radar.js'
	import { buildRadarLayout } from '../lib/brewing/polar.js'
	import { buildSelectDetail } from '../lib/select.js'

	type Row = Record<string, unknown>

	type AxisSpec = {
		key: string
		label?: string
		unit?: string
		domain?: [number, number]
		ticks?: number
		tickLabels?: string[]
		format?: (value: number) => unknown
		weight?: number
	}

	// The shape `buildRadarMarks` documents in its `@returns`. Other geoms leave `geom.marks`
	// untyped because they only ever spread it in a template; this one also reads it in script
	// (see `strokeBySeries`), which needs a real element type.
	type RadarMark = {
		d: string
		fill: string
		stroke: string
		alpha: number
		key: string
		patternId: string | null
	}

	type Options = {
		grid?: boolean
		rings?: number
		sharedDomain?: boolean
		radiusScale?: 'linear' | 'sqrt' | 'auto'
	}

	type Props = {
		axes?: (string | AxisSpec)[]
		axis?: string
		value?: string
		series?: string
		pattern?: string
		/** Fixed area opacity 0–1; defaults to the per-geom preset (radar = 0.25). */
		alpha?: number
		stat?: string
		options?: Options
		onselect?: (data: Row) => void
	}

	let {
		axes,
		axis,
		value,
		series,
		pattern,
		alpha,
		stat = 'identity',
		options = {},
		onselect = undefined
	}: Props = $props()

	// Space reserved outside the outer ring for axis labels, in pixels — MUST stay numerically
	// identical to `LABEL_MARGIN` in `geoms/lib/marks/radar.js`. That adapter computes its own
	// outer radius from the same `innerWidth`/`innerHeight` to build the polygons; this
	// component independently calls the shared pure `buildRadarLayout` (see its doc comment —
	// it's meant to be called from both the Radar geom and any future sparkline-style radar) to
	// get the grid/spokes/labels geometry the adapter doesn't return. Both call sites must
	// resolve to the same R or the grid drawn here would disagree with the polygons.
	const LABEL_MARGIN = 32
	const LABEL_GAP = 12
	const ZERO_MARKER_HALF_SPAN_DEG = 6
	const VERTEX_RADIUS = 3

	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'radar',
		channels: { x: axis, y: value, color: series, pattern },
		stat,
		options: {
			axes,
			sharedDomain: options.sharedDomain,
			rings: options.rings,
			radiusScale: options.radiusScale
		},
		alpha,
		build: buildRadarMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const marks: RadarMark[] = $derived(geom.marks)
	const w = $derived(plotState.innerWidth)
	const h = $derived(plotState.innerHeight)
	const R = $derived(Math.max(0, Math.min(w, h) / 2 - LABEL_MARGIN))

	// Radar takes its own channel props — like `GeomState.marks`, this never falls back to the
	// container's `x`/`y`. Without both `axis` and `value` there is nothing coherent to lay a
	// polar grid out against, so no layout is computed at all (mirrors `buildRadarMarks`'s own
	// `!channels?.x || !channels?.y` guard for the polygons).
	const layout = $derived(
		axis !== undefined && value !== undefined
			? buildRadarLayout(
					geom.data,
					{ x: axis, y: value, color: series },
					{
						axes,
						sharedDomain: options.sharedDomain,
						rings: options.rings,
						radiusScale: options.radiusScale,
						R
					}
				)
			: null
	)

	function toXY(angleDeg: number, radius: number) {
		const rad = (angleDeg * Math.PI) / 180
		return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) }
	}

	// cos(angle) is within float error of 0 only at true vertical (±90°, top/bottom); every
	// other axis angle sits comfortably to one side, so a tight epsilon can't misclassify a
	// real left/right axis as 'middle'.
	function anchorFor(angleDeg: number): 'start' | 'middle' | 'end' {
		const cosA = Math.cos((angleDeg * Math.PI) / 180)
		if (Math.abs(cosA) < 1e-6) return 'middle'
		return cosA > 0 ? 'start' : 'end'
	}

	// `buildRadarMarks` keys every mark `${seriesKey}::fill` / `${seriesKey}::stroke` so paint
	// order (all fills, then all strokes) is inspectable from the key alone; this recovers the
	// series value from that key for the `data-plot-series` hook.
	function seriesOf(key: string) {
		return key.slice(0, key.lastIndexOf('::'))
	}

	// Series stroke colour, recovered from the adapter's stroke marks (the ones with no fill)
	// rather than re-resolving the palette here. A vertex dot has to match its own polygon's
	// outline, and the only way to guarantee that is to read the same value the outline used.
	const strokeBySeries = $derived(
		new Map(
			marks.filter((mark) => mark.fill === 'none').map((mark) => [seriesOf(mark.key), mark.stroke])
		)
	)

	// A vertex is reachable when either the geom was handed its own callback or the plot is
	// running interactively. Deliberately NOT the `keyboardNav` action: that walks a 1-D
	// category list in DOM order, and radar's vertices are a 2-D series × axis grid, so
	// left/right traversal has no meaning here. Tab reach plus Enter/Space, like Point/Arc.
	const reachable = $derived(Boolean(onselect) || plotState.interactive)

	function selectVertex(row: Row, seriesKey: unknown, event: MouseEvent | KeyboardEvent) {
		onselect?.(row)
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail(
					row,
					// `row` is one of the container's original row objects — averaging happens
					// inside polar.js precisely so this lookup resolves instead of returning -1.
					plotState.data.indexOf(row),
					{ x: axis, y: value },
					'radar',
					seriesKey,
					event
				)
			)
	}

	// A short dashed arc at the radius where value 0 sits on this one spoke — see
	// `zeroRingFor`'s doc comment for why this can't just be a shared ring.
	function zeroMarkerPath(angleDeg: number, radius: number) {
		const p1 = toXY(angleDeg - ZERO_MARKER_HALF_SPAN_DEG, radius)
		const p2 = toXY(angleDeg + ZERO_MARKER_HALF_SPAN_DEG, radius)
		return `M${p1.x},${p1.y} A${radius},${radius} 0 0 1 ${p2.x},${p2.y}`
	}
</script>

<g data-plot-geom="radar" transform="translate({w / 2}, {h / 2})">
	{#if layout && options.grid}
		{#each layout.rings as ring, i (i)}
			<circle data-plot-element="radar-grid-ring" cx="0" cy="0" r={ring.radius} />
		{/each}
		{#each layout.axes as ax, i (ax.key)}
			{@const { x: sx, y: sy } = toXY(layout.angles[i], layout.radius)}
			<line
				data-plot-element="radar-grid-spoke"
				data-plot-axis={ax.key}
				x1="0"
				y1="0"
				x2={sx}
				y2={sy}
			/>
		{/each}
		{#each layout.zeroRings as zr, i (i)}
			{#if zr !== null}
				<path data-plot-element="radar-zero-ring" d={zeroMarkerPath(layout.angles[i], zr)} />
			{/if}
		{/each}
		{#if layout.axes.length > 0}
			{#each layout.rings as ring, ringIndex (ringIndex)}
				{@const { x: lx, y: ly } = toXY(layout.angles[0], ring.radius)}
				<text class="radar-ring-label" x={lx} y={ly} dy="-2">{ring.labels[0]}</text>
			{/each}
		{/if}
	{/if}

	{#each marks as mark (mark.key)}
		{#if mark.fill !== 'none'}
			<path
				d={mark.d}
				fill={mark.fill}
				fill-opacity={mark.alpha}
				stroke="none"
				data-plot-element="radar-area"
				data-plot-series={seriesOf(mark.key)}
			/>
			{#if mark.patternId}
				<path
					d={mark.d}
					fill="url(#{mark.patternId})"
					stroke="none"
					pointer-events="none"
					data-plot-element="radar-area"
					data-plot-series={seriesOf(mark.key)}
				/>
			{/if}
		{:else}
			<path
				d={mark.d}
				fill="none"
				stroke={mark.stroke}
				stroke-width="2"
				data-plot-series={seriesOf(mark.key)}
			/>
		{/if}
	{/each}

	{#if layout}
		{#each [...layout.series] as [seriesKey, seriesVertices] (seriesKey)}
			{#each seriesVertices as vertex, i (i)}
				<!-- A null vertex is a genuine gap in the data — no reading for this (series, axis)
				     cell — so it renders as nothing at all. Plotting it at the centre would invent
				     a zero the source never contained. -->
				{#if vertex}
					{@const { x: vx, y: vy } = toXY(vertex.angle, vertex.radius)}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<circle
						data-plot-element="radar-vertex"
						data-plot-series={String(seriesKey)}
						data-plot-axis={vertex.axisKey}
						cx={vx}
						cy={vy}
						r={VERTEX_RADIUS}
						fill={strokeBySeries.get(String(seriesKey))}
						role={reachable ? 'button' : 'graphics-symbol'}
						tabindex={reachable ? 0 : undefined}
						style:cursor={reachable ? 'pointer' : undefined}
						aria-label="{layout.axes[i].displayLabel}, {vertex.value}"
						onmouseenter={() => plotState.setHovered(vertex.row)}
						onmouseleave={() => plotState.clearHovered()}
						onclick={reachable ? (e) => selectVertex(vertex.row, seriesKey, e) : undefined}
						onkeydown={reachable
							? (e) =>
									(e.key === 'Enter' || e.key === ' ') && selectVertex(vertex.row, seriesKey, e)
							: undefined}
					/>
				{/if}
			{/each}
		{/each}
	{/if}

	{#if layout}
		{#each layout.axes as ax, i (ax.key)}
			{@const { x: lx, y: ly } = toXY(layout.angles[i], layout.radius + LABEL_GAP)}
			<text
				data-plot-element="radar-axis-label"
				data-plot-axis={ax.key}
				x={lx}
				y={ly}
				text-anchor={anchorFor(layout.angles[i])}
				dominant-baseline="central">{ax.displayLabel}</text
			>
		{/each}
	{/if}
</g>

<style>
	[data-plot-element='radar-grid-ring'] {
		fill: none;
		stroke: var(--chart-grid-color, currentColor);
		stroke-width: var(--chart-grid-width, 1);
		stroke-dasharray: var(--chart-grid-dash, 2 4);
		opacity: var(--chart-grid-opacity, 0.15);
		pointer-events: none;
	}
	[data-plot-element='radar-grid-spoke'] {
		stroke: var(--chart-grid-color, currentColor);
		stroke-width: var(--chart-grid-width, 1);
		opacity: var(--chart-grid-opacity, 0.15);
		pointer-events: none;
	}
	[data-plot-element='radar-zero-ring'] {
		fill: none;
		stroke: var(--chart-grid-color, currentColor);
		stroke-width: var(--chart-grid-width, 1);
		stroke-dasharray: 3 3;
		opacity: 0.5;
		pointer-events: none;
	}
	[data-plot-element='radar-axis-label'] {
		font-size: 11px;
		fill: currentColor;
		pointer-events: none;
	}
	.radar-ring-label {
		font-size: 9px;
		fill: currentColor;
		opacity: 0.6;
		pointer-events: none;
	}
</style>
