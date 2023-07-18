<script>
	import { getContext } from 'svelte'

	let chart = getContext('chart')
	$: data = $chart.violin()
</script>

{#each data as { x, curve }}
	<path d={curve} transform="translate({x},0)" fill="gray" stroke="none" />
{/each}
