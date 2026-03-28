<script>
	// @ts-nocheck
	import { AreaChart, BarChart, Sparkline } from '@rokkit/chart'
	import { Table } from '@rokkit/ui'

	let { data } = $props()

	const fmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
	const fmtCurrency = (v) => '$' + fmt.format(v)
	const fmtPct = (v) => (v > 0 ? '+' : '') + v.toFixed(1) + '%'

	// Orders table columns
	const orderColumns = [
		{ name: 'id', label: 'Order ID' },
		{ name: 'customer', label: 'Customer' },
		{ name: 'category', label: 'Category' },
		{ name: 'amount', label: 'Amount' },
		{ name: 'status', label: 'Status' },
		{ name: 'date', label: 'Date' }
	]
</script>

<div class="flex flex-col gap-6 p-6">

	<!-- Page title -->
	<div>
		<h1 class="text-surface-z8 text-xl font-semibold">Dashboard</h1>
		<p class="text-surface-z5 mt-0.5 text-sm">Business overview · March 2026</p>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-4 gap-4">
		{#each Object.values(data.kpis) as kpi (kpi.label)}
			<div
				class="rounded-xl border p-4"
				style="background: var(--color-surface-z2); border-color: var(--color-surface-z3)"
			>
				<div class="text-surface-z5 text-xs font-medium tracking-wide uppercase">{kpi.label}</div>
				<div class="text-surface-z9 mt-2 text-2xl font-bold tabular-nums">
					{kpi.label.includes('Revenue') || kpi.label.includes('Avg')
						? fmtCurrency(kpi.value)
						: fmt.format(kpi.value)}
				</div>
				<div
					class="mt-1 text-xs font-medium"
					style="color: {kpi.change >= 0 ? 'var(--color-success-z6)' : 'var(--color-error-z6)'}"
				>
					{fmtPct(kpi.change)} vs last year
				</div>
			</div>
		{/each}
	</div>

	<!-- Charts row -->
	<div class="grid grid-cols-3 gap-4">

		<!-- Revenue trend (spans 2 cols) -->
		<div
			class="col-span-2 rounded-xl border p-4"
			style="background: var(--color-surface-z2); border-color: var(--color-surface-z3)"
		>
			<div class="text-surface-z7 mb-4 font-medium">Revenue Trend</div>
			<AreaChart data={data.revenue} x="month" y="revenue" height={220} />
		</div>

		<!-- By category -->
		<div
			class="rounded-xl border p-4"
			style="background: var(--color-surface-z2); border-color: var(--color-surface-z3)"
		>
			<div class="text-surface-z7 mb-4 font-medium">Revenue by Category</div>
			<BarChart data={data.categories} x="revenue" y="category" height={220} />
		</div>

	</div>

	<!-- Sparklines row -->
	<div
		class="rounded-xl border p-4"
		style="background: var(--color-surface-z2); border-color: var(--color-surface-z3)"
	>
		<div class="text-surface-z7 mb-4 font-medium">Category Trends</div>
		<div class="grid grid-cols-5 gap-4">
			{#each data.sparklines as s (s.category)}
				<div>
					<div class="text-surface-z5 mb-1 text-xs">{s.category}</div>
					<Sparkline data={s.data} field="value" height={48} />
				</div>
			{/each}
		</div>
	</div>

	<!-- Recent Orders table -->
	<div
		class="rounded-xl border"
		style="background: var(--color-surface-z2); border-color: var(--color-surface-z3)"
	>
		<div class="border-b px-4 py-3" style="border-color: var(--color-surface-z3)">
			<span class="text-surface-z7 font-medium">Recent Orders</span>
		</div>
		<Table
			data={data.orders}
			columns={orderColumns}
		/>
	</div>

</div>
