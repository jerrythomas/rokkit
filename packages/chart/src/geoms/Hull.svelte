<script lang="ts">
	/**
	 * An outline around each group of points — the convex hull of the `fill` (else `color`)
	 * field's rows, padded so the outline clears the points it encloses.
	 *
	 * Answers "how spread out is this group": a package whose modules span the zone of pain to
	 * the zone of uselessness has a hull the size of the chart. The group field joins the
	 * shared palette, so a hull and the points it encloses take the same colour — or, with
	 * different fields, hulls group by package while points colour by community.
	 *
	 * Place it BEFORE the points so the fill sits behind them.
	 */
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildHullMarks } from './lib/marks/hull.js'

	type Props = {
		x?: string
		y?: string
		/** Group field (and its colour). Wins over `color`. */
		fill?: string
		/** Group field (and its colour) when `fill` is not set. */
		color?: string
		/** Pixels between the outermost points and the outline. */
		padding?: number
		/** Opacity 0–1 of the whole hull; defaults to the preset's `hull` opacity. */
		alpha?: number
		/** Draw the group's name at its centroid. */
		label?: boolean
	}

	let { x, y, fill, color, padding = 10, alpha, label = false }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	const geom = new GeomState(plotState, () => ({
		type: 'hull',
		channels: { x, y, fill, color },
		alpha,
		build: buildHullMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const hulls = $derived(geom.marks)
</script>

{#if hulls.length > 0}
	<g data-plot-geom="hull">
		{#each hulls as h (h.key)}
			<!-- `opacity`, not fill-/stroke-opacity: the padding is a stroke that overlaps the
				 fill, and only element opacity composites the two as one shape. -->
			<path
				d={h.d}
				fill={h.fill}
				stroke={h.fill}
				stroke-width={padding * 2}
				stroke-linejoin="round"
				stroke-linecap="round"
				opacity={h.alpha}
				data-plot-element="hull"
				data-plot-hull={h.group}
			/>
		{/each}
		{#if label}
			{#each hulls as h (h.key)}
				<text
					x={h.at.x}
					y={h.at.y}
					text-anchor="middle"
					dominant-baseline="middle"
					data-plot-element="hull-label">{h.group}</text
				>
			{/each}
		{/if}
	</g>
{/if}

<style>
	[data-plot-geom='hull'] {
		pointer-events: none;
	}
	[data-plot-element='hull-label'] {
		fill: var(--chart-hull-label-color, currentColor);
		font-size: var(--chart-hull-label-size, 11px);
		font-weight: 600;
	}
</style>
