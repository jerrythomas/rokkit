<script>
	import { getContext } from 'svelte'

	const brewer = getContext('chart-brewer')
</script>

{#if brewer && brewer.arcs && brewer.arcs.length > 0}
	<g
		class="chart-arcs"
		data-plot-type="arc"
		transform="translate({brewer.width / 2}, {brewer.height / 2})"
	>
		{#each brewer.arcs as arc (arc.key)}
			<path
				d={arc.d}
				fill={arc.fill}
				stroke={arc.stroke}
				stroke-width="1"
				data-plot-element="arc"
			/>
		{/each}
	</g>
{/if}

<style>
	.chart-arcs {
		pointer-events: none;
	}
</style>
