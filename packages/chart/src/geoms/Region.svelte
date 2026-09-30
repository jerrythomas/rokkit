<script lang="ts">
	/**
	 * A shaded region in DATA coordinates — a band (`x` and/or `y` as `[lo, hi]`) or a polygon
	 * (`points`).
	 *
	 * The zones on a main-sequence diagram, the quadrants of a hotspot map, the threshold box
	 * of a code-smell detection rule: each is a statement about the metric PLANE, not about
	 * any row, so a region reads no data and registers no geom. It never moves the scales —
	 * declare `xDomain`/`yDomain` on the chart when the region, not the data, defines the frame.
	 *
	 * SVG paints in document order, so place a Region BEFORE the marks it sits behind.
	 */
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { regionVertices, positionOf, centroid, polygonPath } from '../lib/region.js'
	import PlotAreaClip from './lib/PlotAreaClip.svelte'

	type Value = number | string
	type Props = {
		/**
		 * `[lo, hi]` on the x axis. Omit to span the whole axis; a `null` end runs to that edge,
		 * so `[p75, null]` is "the top quartile and beyond". A band category covers its band.
		 */
		x?: [Value | null, Value | null]
		/** `[lo, hi]` on the y axis, with the same open-end rule. */
		y?: [Value | null, Value | null]
		/** Polygon vertices as `[x, y]` pairs in data coordinates. Wins over `x`/`y`. */
		points?: Array<[Value, Value]>
		/** Theming hook — rendered as `data-plot-region="<name>"`. */
		name?: string
		/** Text drawn at the region's centroid (or at `labelAt`). */
		label?: string
		/** `[x, y]` in data coordinates for the label, when the centroid is the wrong spot. */
		labelAt?: [Value, Value]
		/** Literal fill colour. Defaults to `--chart-region-fill`. */
		fill?: string
		/** Fill opacity 0–1. Defaults to `--chart-region-opacity`. */
		alpha?: number
		/** Optional outline colour. */
		stroke?: string
	}

	let {
		x = undefined,
		y = undefined,
		points = undefined,
		name = undefined,
		label = undefined,
		labelAt = undefined,
		fill = undefined,
		alpha = undefined,
		stroke = undefined
	}: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	const uid = $props.id()
	const clipId = `plot-region-clip-${uid}`

	const shape = $derived.by(() => {
		const xs = plotState.xScale
		const ys = plotState.yScale
		if (!xs || !ys) return null
		const uv = regionVertices({ x, y, points }, xs, ys)
		if (uv.length === 0) return null
		const pts = uv.map(([u, v]) => plotState.place(u, v))
		const at = labelAt
			? plotState.place(positionOf(xs, labelAt[0]), positionOf(ys, labelAt[1]))
			: centroid(pts)
		return { d: polygonPath(pts), at }
	})
</script>

{#if shape}
	<PlotAreaClip id={clipId} />
	<g data-plot-geom="region" data-plot-region={name} clip-path="url(#{clipId})">
		<path
			d={shape.d}
			fill={fill}
			fill-opacity={alpha}
			stroke={stroke}
			data-plot-element="region"
		/>
		{#if label}
			<text
				x={shape.at.x}
				y={shape.at.y}
				text-anchor="middle"
				dominant-baseline="middle"
				data-plot-element="region-label">{label}</text
			>
		{/if}
	</g>
{/if}

<style>
	[data-plot-geom='region'] {
		pointer-events: none;
	}
	[data-plot-element='region']:not([fill]) {
		fill: var(--chart-region-fill, currentColor);
	}
	[data-plot-element='region']:not([fill-opacity]) {
		fill-opacity: var(--chart-region-opacity, 0.08);
	}
	[data-plot-element='region']:not([stroke]) {
		stroke: none;
	}
	[data-plot-element='region-label'] {
		fill: var(--chart-region-label-color, currentColor);
		font-size: var(--chart-region-label-size, 11px);
		opacity: var(--chart-region-label-opacity, 0.75);
	}
</style>
