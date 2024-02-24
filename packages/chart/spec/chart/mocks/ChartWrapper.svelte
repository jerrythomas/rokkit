<script>
	import Chart from '../../../src/chart/Chart.svelte'

	export let component
	export let props = {}
	export let chart
</script>

<Chart {...chart}>
	<svelte:component this={component} {...props} />
</Chart>
