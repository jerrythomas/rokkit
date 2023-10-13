<script>
	import Chart from '../../../src/chart/Chart.svelte'
	export let component
	export let props
</script>

<Chart>
	<svelte:component this={component} {...props} />
</Chart>
