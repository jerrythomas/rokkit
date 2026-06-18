<script lang="ts">
	import { getContext } from 'svelte'
	import { line as d3Line, type CurveFactory } from 'd3-shape'
	import type { PlotState } from '../PlotState.svelte.js'

	type Datum = Record<string, unknown> | number

	type Props = {
		data?: Datum[]
		x?: string
		y?: string
		stroke?: string
		strokeWidth?: number
		curve?: CurveFactory
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		stroke = 'steelblue',
		strokeWidth = 2,
		curve = undefined
	}: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const accessor = (d: Datum, field: string | undefined): unknown =>
		field && typeof d === 'object' ? d[field] : d

	const path = $derived.by(() => {
		if (!state?.xScale || !state?.yScale || !data?.length) return null
		const xScale = state.xScale
		const yScale = state.yScale
		const lineGen = d3Line<Datum>()
			.x((d) => xScale(accessor(d, x)) ?? 0)
			.y((d) => yScale(accessor(d, y)) ?? 0)
			.defined((d) => d != null)
		if (curve) lineGen.curve(curve)
		return lineGen(data)
	})
</script>

{#if path}
	<path
		d={path}
		fill="none"
		{stroke}
		stroke-width={strokeWidth}
		stroke-linejoin="round"
		stroke-linecap="round"
		data-plot-element="line"
	/>
{/if}
