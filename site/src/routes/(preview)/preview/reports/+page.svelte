<script>
	// @ts-nocheck
	import { Select, Toolbar } from '@rokkit/ui'

	const periodOptions = [
		{ label: 'Last 7 days', value: '7d' },
		{ label: 'Last 30 days', value: '30d' },
		{ label: 'Last quarter', value: '90d' }
	]

	let period = $state('30d')
	const selectFields = { label: 'label', value: 'value' }
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-surface-z8 text-2xl font-bold">Reports</h1>
		<Toolbar>
			<Select items={periodOptions} bind:value={period} fields={selectFields} />
		</Toolbar>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div data-card class="flex min-h-52 flex-col items-center justify-center gap-2 p-4 text-center">
			<span class="i-solar:chart-2-bold-duotone text-surface-z3 text-3xl" aria-hidden="true"></span>
			<p class="text-surface-z5 text-sm">Task completion — Bar Chart</p>
			<p class="text-surface-z4 text-xs">Chart integration in progress</p>
		</div>

		<div data-card class="flex min-h-52 flex-col items-center justify-center gap-2 p-4 text-center">
			<span class="i-solar:graph-new-bold-duotone text-surface-z3 text-3xl" aria-hidden="true"
			></span>
			<p class="text-surface-z5 text-sm">Velocity over time — Line Chart</p>
			<p class="text-surface-z4 text-xs">Chart integration in progress</p>
		</div>
	</div>

	<div data-card class="flex min-h-32 flex-col items-center justify-center gap-2 p-4 text-center">
		<span class="i-solar:table-bold-duotone text-surface-z3 text-3xl" aria-hidden="true"></span>
		<p class="text-surface-z5 text-sm">Summary Data Table</p>
		<p class="text-surface-z4 text-xs">DataTable component coming soon</p>
	</div>
</div>
