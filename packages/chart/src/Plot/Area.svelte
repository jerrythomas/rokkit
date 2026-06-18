<script lang="ts">
	import { getContext } from 'svelte'
	import { area as d3Area, type CurveFactory } from 'd3-shape'
	import type { PlotState } from '../PlotState.svelte.js'

	type Datum = Record<string, unknown> | number

	type Props = {
		data?: Datum[]
		x?: string
		y?: string
		y0?: string
		fill?: string
		opacity?: number
		curve?: CurveFactory
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		y0 = undefined,
		fill = 'steelblue',
		opacity = 0.7,
		curve = undefined
	}: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const accessor = (d: Datum, field: string | undefined): unknown =>
		field && typeof d === 'object' ? d[field] : d

	const path = $derived.by(() => {
		if (!state?.xScale || !state?.yScale || !data?.length) return null
		const xScale = state.xScale
		const yScale = state.yScale
		const innerHeight = state.innerHeight
		const areaGen = d3Area<Datum>()
			.x((d) => xScale(accessor(d, x)) ?? 0)
			.y1((d) => yScale(accessor(d, y)) ?? 0)
			.y0((d) =>
				y0 !== undefined
					? (yScale((typeof d === 'object' ? d[y0] : undefined) ?? y0) ?? innerHeight)
					: innerHeight
			)
			.defined((d) => d != null)
		if (curve) areaGen.curve(curve)
		return areaGen(data)
	})
</script>

{#if path}
	<path d={path} {fill} {opacity} stroke="none" data-plot-element="area" />
{/if}
