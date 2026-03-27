<script>
	import { getContext } from 'svelte'

	const brewer = getContext('chart-brewer')
</script>

{#if brewer && brewer.areas && brewer.areas.length > 0}
	<g class="chart-areas" data-plot-type="area">
		{#each brewer.areas as seg (seg.key ?? seg.d)}
			<path d={seg.d} fill={seg.fill} stroke={seg.stroke} opacity="0.7" data-plot-element="area" />
		{/each}
	</g>
{/if}

<style>
	.chart-areas {
		pointer-events: none;
	}
</style>
