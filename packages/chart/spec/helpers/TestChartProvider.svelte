<script>
	import ChartProvider from '../../src/ChartProvider.svelte'
	import TestChartProviderChild from './TestChartProviderChild.svelte'

	let { preset } = $props()
</script>

<ChartProvider {preset}>
	<TestChartProviderChild />
</ChartProvider>
