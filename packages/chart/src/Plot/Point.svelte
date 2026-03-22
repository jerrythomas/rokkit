<script>
	import { getContext } from 'svelte'

	const brewer = getContext('chart-brewer')
</script>

{#if brewer && brewer.points && brewer.points.length > 0}
	<g class="chart-points" data-plot-type="point">
		{#each brewer.points as pt, i (i)}
			<circle
				cx={pt.cx}
				cy={pt.cy}
				r={pt.r}
				fill={pt.fill}
				stroke={pt.stroke}
				stroke-width="1"
				data-plot-element="point"
			/>
		{/each}
	</g>
{/if}

<style>
	.chart-points {
		pointer-events: none;
	}
</style>
