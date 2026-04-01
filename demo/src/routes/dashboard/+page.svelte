<script>
	// @ts-nocheck
	import { AreaChart, BarChart, Sparkline } from '@rokkit/chart'
	import { Table } from '@rokkit/ui'
	import { vibe, watchMedia } from '@rokkit/states'

	let { data } = $props()

	const fmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
	const fmtCurrency = (v) => `$${  fmt.format(v)}`
	const fmtPct = (v) => `${(v > 0 ? '+' : '') + v.toFixed(1)  }%`

	// Resolve system → actual light/dark for chart mode prop
	const systemDark = watchMedia('(prefers-color-scheme: dark)')
	const chartMode = $derived(
		vibe.mode === 'system' ? (systemDark.current ? 'dark' : 'light') : vibe.mode
	)

	// Responsive chart widths — measured from each card's inner content area
	let revenueCardWidth = $state(0)
	let categoryCardWidth = $state(0)

	// KPI card widths for sparklines
	let kpiCardWidths = $state([0, 0, 0, 0])

	// Orders table columns
	const orderColumns = [
		{ name: 'id', label: 'Order ID', width: '120px' },
		{ name: 'customer', label: 'Customer' },
		{ name: 'category', label: 'Category' },
		{ name: 'amount', label: 'Amount', align: 'right', formatter: (v) => fmtCurrency(Number(v)) },
		{ name: 'status', label: 'Status' },
		{ name: 'date', label: 'Date', width: '110px' }
	]

	const statusStyle = {
		Completed:  { dot: 'bg-success-z5'  },
		Processing: { dot: 'bg-primary-z5'  },
		Pending:    { dot: 'bg-warning-z5'  },
		Cancelled:  { dot: 'bg-error-z5'    },
	}
	const pillClass = 'text-surface-z6 bg-surface-z2 border border-surface-z3'
</script>

<div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">

	<!-- Page title -->
	<div>
		<h1 class="text-surface-z8 text-xl font-semibold">Dashboard</h1>
		<p class="text-surface-z5 mt-0.5 text-sm">Business overview · March 2026</p>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each Object.values(data.kpis) as kpi, i (kpi.label)}
			<div class="bg-surface-z2 border-surface-z3 rounded-xl border p-4">
				<div class="text-surface-z5 text-xs font-medium tracking-wide uppercase">{kpi.label}</div>
				<div class="mt-2 flex items-center justify-between gap-2">
					<div class="text-surface-z9 shrink-0 text-2xl font-bold tabular-nums">
						{kpi.label.includes('Revenue') || kpi.label.includes('Avg')
							? fmtCurrency(kpi.value)
							: fmt.format(kpi.value)}
					</div>
					<div class="min-w-0 flex-1" bind:clientWidth={kpiCardWidths[i]}>
						{#if kpiCardWidths[i] > 0}
							<Sparkline data={data.kpiTrends[kpi.sparkKey]} field="value" width={kpiCardWidths[i]} height={40} />
						{/if}
					</div>
				</div>
				<div
					class="mt-2 text-xs font-medium"
					class:text-success-z6={kpi.change >= 0}
					class:text-error-z6={kpi.change < 0}
				>
					{fmtPct(kpi.change)} vs last year
				</div>
			</div>
		{/each}
	</div>

	<!-- Charts row -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">

		<!-- Revenue trend (spans 2 cols) -->
		<div class="bg-surface-z2 border-surface-z3 rounded-xl border p-4 lg:col-span-2" bind:clientWidth={revenueCardWidth}>
			<div class="text-surface-z7 mb-4 font-medium">Revenue Trend</div>
			{#if revenueCardWidth > 0}
			<AreaChart data={data.revenue} x="month" y="revenue" width={Math.max(revenueCardWidth - 32, 100)} height={220} mode={chartMode} yFormat={(v) => fmt.format(v)} />
		{/if}
		</div>

		<!-- By category -->
		<div class="bg-surface-z2 border-surface-z3 rounded-xl border p-4" bind:clientWidth={categoryCardWidth}>
			<div class="text-surface-z7 mb-4 font-medium">Revenue by Category</div>
			{#if categoryCardWidth > 0}
			<BarChart data={data.categories} x="category" y="revenue" fill="category" width={Math.max(categoryCardWidth - 32, 100)} height={220} mode={chartMode} yFormat={(v) => fmt.format(v)} />
		{/if}
		</div>

	</div>

	<!-- Recent Orders table -->
	<div class="bg-surface-z1 border-surface-z3 overflow-hidden rounded-xl border">

		<!-- Sub-header -->
		<div class="bg-surface-z1 border-surface-z3 border-b px-5 py-4">
			<h3 class="text-surface-z8 text-sm font-semibold">Recent Orders</h3>
			<p class="text-surface-z5 mt-1 text-xs">Latest transactions across all categories · March 2026</p>
		</div>

		<!-- Table -->
		<Table data={data.orders} columns={orderColumns} responsive size="sm" class="max-h-72" cell={orderCell} />

		<!-- Footer -->
		<div class="border-surface-z3 bg-surface-z1 border-t px-5 py-3">
			<p class="text-surface-z4 text-xs">Showing {data.orders.length} most recent orders</p>
		</div>
	</div>

{#snippet orderCell(value, column, row)}
	{#if column.name === 'status'}
		{@const s = statusStyle[String(value)] ?? { dot: 'bg-surface-z4' }}
		<div class="flex items-center gap-1.5">
			<span class="h-2 w-2 shrink-0 rounded-full {s.dot}"></span>
			<span class="rounded px-1.5 py-0.5 text-xs font-normal uppercase tracking-wide {pillClass}">{value}</span>
		</div>
	{:else}
		<span data-cell-value>{column.formatter ? column.formatter(value, row) : String(value ?? '')}</span>
	{/if}
{/snippet}

</div>
