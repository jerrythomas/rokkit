<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'

	type Props = {
		lines?: 'auto' | 'x' | 'y' | 'both'
		xTicks?: number
		yTicks?: number
	}
	let { lines = 'auto', xTicks = 6, yTicks = 6 }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const isBand = (s: unknown) =>
		!!s && typeof (s as { bandwidth?: unknown }).bandwidth === 'function'

	const showX = $derived(
		lines === 'x' || lines === 'both' || (lines === 'auto' && isBand(state.xScale))
	)
	const showY = $derived(lines === 'auto' || lines === 'y' || lines === 'both')

	const yLines = $derived.by(() => {
		const s = state.yScale
		if (!showY || !s || typeof s.ticks !== 'function') return []
		return s.ticks(yTicks).map((val: number) => ({ pos: s(val) }))
	})

	const xLines = $derived.by(() => {
		const s = state.xScale
		if (!showX || !s) return []
		if (isBand(s))
			return s.domain().map((val: unknown) => ({ pos: (s(val) ?? 0) + s.bandwidth() / 2 }))
		if (typeof s.ticks !== 'function') return []
		return s.ticks(xTicks).map((val: number) => ({ pos: s(val) }))
	})
</script>

<g class="grid" data-plot-grid>
	{#each yLines as line (line.pos)}
		<line x1="0" y1={line.pos} x2={state.innerWidth} y2={line.pos} data-plot-grid-line="y" />
	{/each}
	{#each xLines as line (line.pos)}
		<line x1={line.pos} y1="0" x2={line.pos} y2={state.innerHeight} data-plot-grid-line="x" />
	{/each}
</g>

<style>
	[data-plot-grid-line] {
		stroke: var(--chart-grid-color, currentColor);
		stroke-width: var(--chart-grid-width, 1);
		stroke-dasharray: var(--chart-grid-dash, 2 4);
		opacity: var(--chart-grid-opacity, 0.15);
	}
</style>
