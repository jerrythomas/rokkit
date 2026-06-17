<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'

	type Props = {
		type?: 'x' | 'y'
		label?: string
		format?: (v: unknown) => string
		ticks?: number
		minorTicks?: boolean
		showLine?: boolean
		showTicks?: boolean
		showLabels?: boolean
	}

	type Tick = { value: unknown; pos: number; minor: boolean }

	let {
		type = 'x',
		label = '',
		format = undefined,
		ticks: tickCount = 6,
		minorTicks = false,
		showLine = true,
		showTicks = true,
		showLabels = true
	}: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const MINOR_DIVISIONS = 4

	function buildTicks(s: PlotState['xScale']): Tick[] {
		if (!s) return []
		if (typeof s.bandwidth === 'function') {
			return s.domain().map((val: unknown) => ({
				value: val,
				pos: (s(val) ?? 0) + s.bandwidth() / 2,
				minor: false
			}))
		}
		const major: Tick[] = s
			.ticks(tickCount)
			.map((val: number) => ({ value: val, pos: s(val), minor: false }))
		if (!minorTicks || major.length < 2) return major
		const result: Tick[] = []
		for (let i = 0; i < major.length; i++) {
			result.push(major[i])
			if (i < major.length - 1) {
				const step = (major[i + 1].pos - major[i].pos) / MINOR_DIVISIONS
				for (let j = 1; j < MINOR_DIVISIONS; j++) {
					result.push({ value: null, pos: major[i].pos + step * j, minor: true })
				}
			}
		}
		return result
	}

	const xTicks = $derived(buildTicks(state.xScale))
	const yTicks = $derived(buildTicks(state.yScale))

	const xTransform = $derived(`translate(0, ${state.xAxisY ?? state.innerHeight})`)
	const yTransform = $derived(`translate(${state.yAxisX ?? 0}, 0)`)
</script>

{#if type === 'x'}
	<g class="axis x-axis" transform={xTransform} data-plot-axis="x">
		{#if showLine}
			<line x1="0" y1="0" x2={state.innerWidth} y2="0" data-plot-axis-line />
		{/if}
		{#each xTicks as tick (tick.minor ? `minor-${tick.pos}` : tick.value)}
			<g transform="translate({tick.pos}, 0)" data-plot-tick>
				{#if showTicks}
					<line
						x1="0" y1="0" x2="0"
						y2={tick.minor ? 3 : 6}
						stroke="currentColor"
						opacity={tick.minor ? 0.4 : 1}
					/>
				{/if}
				{#if showLabels && !tick.minor}
					<text x="0" y="9" text-anchor="middle" dominant-baseline="hanging" data-plot-tick-label>
						{format ? format(tick.value) : tick.value}
					</text>
				{/if}
			</g>
		{/each}
		{#if label}
			<text
				x={state.innerWidth / 2}
				y="36"
				text-anchor="middle"
				class="axis-label"
				data-plot-axis-label>{label}</text
			>
		{/if}
	</g>
{:else}
	<g class="axis y-axis" transform={yTransform} data-plot-axis="y">
		{#if showLine}
			<line x1="0" y1="0" x2="0" y2={state.innerHeight} data-plot-axis-line />
		{/if}
		{#each yTicks as tick (tick.minor ? `minor-${tick.pos}` : tick.value)}
			<g transform="translate(0, {tick.pos})" data-plot-tick>
				{#if showTicks}
					<line
						x1={tick.minor ? -3 : -6} y1="0" x2="0" y2="0"
						stroke="currentColor"
						opacity={tick.minor ? 0.4 : 1}
					/>
				{/if}
				{#if showLabels && !tick.minor}
					<text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-plot-tick-label>
						{format ? format(tick.value) : tick.value}
					</text>
				{/if}
			</g>
		{/each}
		{#if label}
			<text
				transform="rotate(-90)"
				x={-(state.innerHeight / 2)}
				y="-40"
				text-anchor="middle"
				class="axis-label"
				data-plot-axis-label>{label}</text
			>
		{/if}
	</g>
{/if}

<style>
	.axis {
		font-size: 11px;
		fill: currentColor;
		stroke: currentColor;
	}
	.axis-label {
		font-size: 13px;
		font-weight: 500;
	}
	[data-plot-axis-line] {
		stroke: currentColor;
	}
</style>
