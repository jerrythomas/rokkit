<script>
	import { getContext } from 'svelte'

	/** @type {'x' | 'y'} */
	let { type = 'x', label = '' } = $props()

	const state = getContext('plot-state')

	const xTicks = $derived.by(() => {
		const s = state.xScale
		if (!s) return []
		if (typeof s.bandwidth === 'function') {
			return s.domain().map((val) => ({
				value: val,
				pos: (s(val) ?? 0) + s.bandwidth() / 2
			}))
		}
		return s.ticks(6).map((val) => ({ value: val, pos: s(val) }))
	})

	const yTicks = $derived.by(() => {
		const s = state.yScale
		if (!s) return []
		if (typeof s.bandwidth === 'function') {
			return s.domain().map((val) => ({
				value: val,
				pos: (s(val) ?? 0) + s.bandwidth() / 2
			}))
		}
		return s.ticks(6).map((val) => ({ value: val, pos: s(val) }))
	})

	const xTransform = $derived(`translate(0, ${state.xAxisY ?? state.innerHeight})`)
	const yTransform = $derived(`translate(${state.yAxisX ?? 0}, 0)`)
</script>

{#if type === 'x'}
	<g class="axis x-axis" transform={xTransform} data-plot-axis="x">
		<line x1="0" y1="0" x2={state.innerWidth} y2="0" data-plot-axis-line />
		{#each xTicks as tick (tick.value)}
			<g transform="translate({tick.pos}, 0)" data-plot-tick>
				<line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" />
				<text x="0" y="9" text-anchor="middle" dominant-baseline="hanging" data-plot-tick-label>
					{tick.value}
				</text>
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
		<line x1="0" y1="0" x2="0" y2={state.innerHeight} data-plot-axis-line />
		{#each yTicks as tick (tick.value)}
			<g transform="translate(0, {tick.pos})" data-plot-tick>
				<line x1="-6" y1="0" x2="0" y2="0" stroke="currentColor" />
				<text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-plot-tick-label>
					{tick.value}
				</text>
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
