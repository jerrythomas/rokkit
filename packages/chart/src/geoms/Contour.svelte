<script lang="ts">
	/**
	 * Kernel-density contours — where points pile up, drawn as nested rings (or filled bands).
	 *
	 * A scatter of a few hundred modules hides its density: on a main-sequence plot most of
	 * them sit on the A = 0 edge on top of each other. Contours show the pile-up without
	 * binning it into cells the way `Hexbin` does, and they overlay the points instead of
	 * replacing them. Grouped by `fill` (else `color`), each group contours separately.
	 */
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildContourMarks } from './lib/marks/contour.js'
	import PlotAreaClip from './lib/PlotAreaClip.svelte'

	type Props = {
		x?: string
		y?: string
		/** Group field (and its colour). Wins over `color`. */
		fill?: string
		/** Group field (and its colour) when `fill` is not set. */
		color?: string
		/** Kernel bandwidth in pixels — larger is smoother. */
		bandwidth?: number
		/** Approximate number of density levels. */
		thresholds?: number
		/** Fill the bands instead of stroking the rings. */
		filled?: boolean
		/** Opacity of the densest band when filled, or of every ring when stroked. */
		alpha?: number
	}

	let { x, y, fill, color, bandwidth = 20, thresholds = 8, filled = false, alpha }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	const uid = $props.id()
	const clipId = `plot-contour-clip-${uid}`
	const geom = new GeomState(plotState, () => ({
		type: 'contour',
		channels: { x, y, fill, color },
		options: { bandwidth, thresholds },
		alpha,
		build: buildContourMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const rings = $derived(geom.marks)
	const grouped = $derived(Boolean(fill ?? color))
</script>

{#if rings.length > 0}
	<PlotAreaClip id={clipId} />
	<g
		data-plot-geom="contour"
		data-plot-contour-mode={filled ? 'filled' : 'lines'}
		clip-path="url(#{clipId})"
	>
		{#each rings as r (r.key)}
			<path
				d={r.d}
				fill={filled ? r.fill : 'none'}
				fill-opacity={filled ? r.fillAlpha : undefined}
				stroke={filled ? 'none' : grouped ? r.stroke : undefined}
				stroke-opacity={!filled && alpha !== undefined ? alpha : undefined}
				data-plot-element="contour"
				data-plot-contour={r.group}
				data-plot-contour-level={r.level}
			/>
		{/each}
	</g>
{/if}

<style>
	[data-plot-geom='contour'] {
		pointer-events: none;
	}
	[data-plot-contour-mode='lines'] [data-plot-element='contour'] {
		stroke-width: var(--chart-contour-width, 1);
	}
	[data-plot-contour-mode='lines'] [data-plot-element='contour']:not([stroke-opacity]) {
		stroke-opacity: var(--chart-contour-opacity, 0.7);
	}
	[data-plot-contour-mode='lines'] [data-plot-element='contour']:not([stroke]) {
		stroke: var(--chart-contour-color, currentColor);
	}
</style>
