<script>
	import { getContext } from 'svelte'

	let chart = getContext('chart')
	$: data = $chart.violin()
	// $: console.log(data)
</script>

{#each data as { x, curve }}
	<path d={curve} transform="translate({x},0)" fill="gray" stroke="none" />
{/each}
