<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const periodOptions = [
		{ label: 'Last 7 days', value: '7d' },
		{ label: 'Last 30 days', value: '30d' },
		{ label: 'Last quarter', value: '90d' }
	]

	let period = $state('30d')
	const selectFields = { label: 'label', value: 'value' }
</script>

<div class="p-6 flex flex-col gap-6">
	<div class="flex items-center justify-between flex-wrap gap-3">
		<h1 class="text-2xl font-bold text-surface-z8">Reports</h1>
		<Select items={periodOptions} bind:value={period} fields={selectFields} />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div data-card class="p-4 flex flex-col gap-2 min-h-52 items-center justify-center text-center">
			<span class="i-solar:chart-2-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
			<p class="text-sm text-surface-z5">Task completion — Bar Chart</p>
			<p class="text-xs text-surface-z4">Chart integration in progress</p>
		</div>

		<div data-card class="p-4 flex flex-col gap-2 min-h-52 items-center justify-center text-center">
			<span class="i-solar:graph-new-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
			<p class="text-sm text-surface-z5">Velocity over time — Line Chart</p>
			<p class="text-xs text-surface-z4">Chart integration in progress</p>
		</div>
	</div>

	<div data-card class="p-4 flex flex-col gap-2 min-h-32 items-center justify-center text-center">
		<span class="i-solar:table-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
		<p class="text-sm text-surface-z5">Summary Data Table</p>
		<p class="text-xs text-surface-z4">DataTable component coming soon</p>
	</div>
</div>
