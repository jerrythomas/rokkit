<script>
	import { getContext } from 'svelte'

	const brewer = getContext('chart-brewer')
</script>

{#if brewer && brewer.lines && brewer.lines.length > 0}
	<g class="chart-lines" data-plot-type="line">
		{#each brewer.lines as seg (seg.key ?? seg.d)}
			<path
				d={seg.d}
				fill={seg.fill}
				stroke={seg.stroke}
				stroke-width="2"
				stroke-linejoin="round"
				stroke-linecap="round"
				data-plot-element="line"
			/>
		{/each}
	</g>
{/if}

<style>
	.chart-lines {
		pointer-events: none;
	}
</style>
