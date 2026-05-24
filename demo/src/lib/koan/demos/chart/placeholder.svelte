<script lang="ts">
	import { BarChart } from '@rokkit/chart'

	const sales = [
		{ quarter: 'Q1', revenue: 42 },
		{ quarter: 'Q2', revenue: 58 },
		{ quarter: 'Q3', revenue: 51 },
		{ quarter: 'Q4', revenue: 73 }
	]
</script>

<BarChart data={sales} x="quarter" y="revenue" />
