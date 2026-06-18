<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'

	type Datum = Record<string, unknown> | number

	type Props = {
		data?: Datum[]
		x?: string
		y?: string
		r?: number
		fill?: string
		stroke?: string
		strokeWidth?: number
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		r = 4,
		fill = 'steelblue',
		stroke = 'white',
		strokeWidth = 1
	}: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const accessor = (d: Datum, field: string | undefined): unknown =>
		field && typeof d === 'object' ? d[field] : d

	const points = $derived.by(() => {
		if (!state?.xScale || !state?.yScale || !data?.length) return []
		const xScale = state.xScale
		const yScale = state.yScale
		return data
			.map((d) => ({
				cx: xScale(accessor(d, x)) ?? null,
				cy: yScale(accessor(d, y)) ?? null,
				label: `(${accessor(d, x)}, ${accessor(d, y)})`
			}))
			.filter((p) => p.cx !== null && p.cy !== null)
	})
</script>

{#each points as pt, i (i)}
	<circle
		cx={pt.cx}
		cy={pt.cy}
		{r}
		{fill}
		{stroke}
		stroke-width={strokeWidth}
		data-plot-element="point"
		role="graphics-symbol"
		aria-label={pt.label}
	/>
{/each}
