<script>
	// @ts-nocheck
	import { PlotChart, Plot, Sparkline } from '@rokkit/chart'
	import { Select } from '@rokkit/ui'
	import { sales, salesByMonth } from '$lib/data/sales.js'

	// ─── View switcher ────────────────────────────────────────────────────────────
	const views = ['Revenue', 'Orders', 'Profit']
	let selectedView = $state('Revenue')

	// ─── Time filter ──────────────────────────────────────────────────────────────
	const years = [{ label: 'All Years', value: 'all' }, { label: '2023', value: '2023' }, { label: '2024', value: '2024' }]
	let selectedYear = $state('all')

	const filteredSales = $derived(
		selectedYear === 'all' ? sales : sales.filter((r) => String(r.year) === selectedYear)
	)

	// ─── KPIs ─────────────────────────────────────────────────────────────────────
	const liveKpis = $derived({
		totalRevenue: filteredSales.reduce((s, r) => s + r.amount, 0),
		totalOrders: filteredSales.length,
		avgOrderValue: filteredSales.length > 0
			? Math.round(filteredSales.reduce((s, r) => s + r.amount, 0) / filteredSales.length)
			: 0,
		totalProfit: filteredSales.reduce((s, r) => s + r.profit, 0)
	})

	// ─── Monthly trend for sparklines ─────────────────────────────────────────────
	const monthlyTrend = $derived.by(() => {
		const map = new Map()
		for (const row of filteredSales) {
			const entry = map.get(row.month) ?? { month: row.month, amount: 0, orders: 0, profit: 0 }
			entry.amount += row.amount
			entry.orders += 1
			entry.profit += row.profit
			map.set(row.month, entry)
		}
		return [...map.values()].sort((a, b) => a.month.localeCompare(b.month))
	})

	// ─── Chart data ───────────────────────────────────────────────────────────────
	const regionData = $derived.by(() => {
		const map = new Map()
		for (const row of filteredSales) {
			map.set(row.region, (map.get(row.region) ?? 0) + row.amount)
		}
		return [...map.entries()].map(([region, amount]) => ({ region, amount }))
			.sort((a, b) => b.amount - a.amount)
	})

	const categoryData = $derived.by(() => {
		const map = new Map()
		for (const row of filteredSales) {
			map.set(row.category, (map.get(row.category) ?? 0) + row.amount)
		}
		return [...map.entries()].map(([category, amount]) => ({ category, amount }))
	})

	const chartField = $derived(
		selectedView === 'Revenue' ? 'amount' : selectedView === 'Orders' ? 'orders' : 'profit'
	)

	const mainChartData = $derived(selectedView === 'Orders'
		? regionData.map((d) => ({
				region: d.region,
				orders: filteredSales.filter((r) => r.region === d.region).length
			}))
		: regionData.map((d) => ({
				region: d.region,
				amount: d.amount,
				profit: filteredSales.filter((r) => r.region === d.region).reduce((s, r) => s + r.profit, 0)
			}))
	)

	// ─── Top products table ───────────────────────────────────────────────────────
	const topProds = $derived.by(() => {
		const map = new Map()
		for (const row of filteredSales) {
			const entry = map.get(row.product) ?? { product: row.product, category: row.category, amount: 0, orders: 0 }
			entry.amount += row.amount
			entry.orders += 1
			map.set(row.product, entry)
		}
		return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 8)
	})

	function fmtCurrency(v) {
		if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
		if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
		return `$${v}`
	}
</script>

<div class="min-h-full px-6 py-8 lg:px-10" data-dashboard>
	<!-- ── Page header ──────────────────────────────────────────────────────────── -->
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-surface-z8 text-2xl font-bold tracking-tight">Sales Dashboard</h1>
			<p class="text-surface-z5 mt-1 text-sm">B2B SaaS analytics · {filteredSales.length} orders</p>
		</div>
		<div class="flex items-center gap-3">
			<!-- View switcher using Tabs -->
			<div class="flex gap-1 rounded-lg border border-surface-z2 p-1 bg-surface-z1">
				{#each views as v}
					<button
						class="rounded-md px-3 py-1 text-sm transition-colors"
						class:bg-surface-z3={selectedView === v}
						class:text-surface-z8={selectedView === v}
						class:font-medium={selectedView === v}
						class:text-surface-z5={selectedView !== v}
						onclick={() => (selectedView = v)}
					>
						{v}
					</button>
				{/each}
			</div>
			<!-- Year filter -->
			<Select items={years} fields={{ text: 'label', value: 'value' }} bind:value={selectedYear} />
		</div>
	</div>

	<!-- ── KPI Cards ──────────────────────────────────────────────────────────── -->
	<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4" data-kpi-row>
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-kpi-card="revenue">
			<div class="text-surface-z5 mb-1 text-xs font-medium uppercase tracking-wider">Total Revenue</div>
			<div class="text-surface-z8 text-2xl font-bold">{fmtCurrency(liveKpis.totalRevenue)}</div>
			<div class="mt-2">
				<Sparkline data={monthlyTrend} field="amount" type="area" color="primary" width={100} height={28} />
			</div>
		</div>
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-kpi-card="orders">
			<div class="text-surface-z5 mb-1 text-xs font-medium uppercase tracking-wider">Total Orders</div>
			<div class="text-surface-z8 text-2xl font-bold">{liveKpis.totalOrders}</div>
			<div class="mt-2">
				<Sparkline data={monthlyTrend} field="orders" type="bar" color="secondary" width={100} height={28} />
			</div>
		</div>
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-kpi-card="avg">
			<div class="text-surface-z5 mb-1 text-xs font-medium uppercase tracking-wider">Avg Order Value</div>
			<div class="text-surface-z8 text-2xl font-bold">{fmtCurrency(liveKpis.avgOrderValue)}</div>
			<div class="mt-2">
				<Sparkline data={monthlyTrend} field="amount" type="line" color="primary" width={100} height={28} />
			</div>
		</div>
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-kpi-card="profit">
			<div class="text-surface-z5 mb-1 text-xs font-medium uppercase tracking-wider">Total Profit</div>
			<div class="text-surface-z8 text-2xl font-bold">{fmtCurrency(liveKpis.totalProfit)}</div>
			<div class="mt-2">
				<Sparkline data={monthlyTrend} field="profit" type="area" color="secondary" width={100} height={28} />
			</div>
		</div>
	</div>

	<!-- ── Main charts row ──────────────────────────────────────────────────────── -->
	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Revenue by Region bar chart -->
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-5" data-chart-section="region">
			<h3 class="text-surface-z7 mb-4 text-sm font-semibold">{selectedView} by Region</h3>
			<PlotChart
				data={mainChartData}
				spec={{ x: 'region', y: chartField, geoms: [{ type: 'bar' }] }}
				axes
				grid
				width={480}
				height={240}
			/>
		</div>

		<!-- Monthly trend line chart -->
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-5" data-chart-section="trend">
			<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Monthly {selectedView} Trend</h3>
			<Plot.Root data={monthlyTrend} x="month" y={chartField === 'orders' ? 'orders' : chartField} width={480} height={240}>
				<Plot.Grid />
				<Plot.Axis type="x" tickCount={6} />
				<Plot.Axis type="y" />
				<Plot.Area data={monthlyTrend} x="month" y={chartField === 'orders' ? 'orders' : chartField} fill="var(--color-primary)" opacity={0.15} />
				<Plot.Line data={monthlyTrend} x="month" y={chartField === 'orders' ? 'orders' : chartField} stroke="var(--color-primary)" strokeWidth={2} />
			</Plot.Root>
		</div>
	</div>

	<!-- ── Bottom row: category breakdown + top products ───────────────────────── -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
		<!-- Category pie chart -->
		<div class="border-surface-z2 bg-surface-z1 lg:col-span-2 rounded-xl border p-5" data-chart-section="category">
			<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Revenue by Category</h3>
			<PlotChart
				data={categoryData}
				spec={{ label: 'category', value: 'amount', geoms: [{ type: 'arc' }] }}
				width={260}
				height={240}
			/>
		</div>

		<!-- Top products table -->
		<div class="border-surface-z2 bg-surface-z1 lg:col-span-3 rounded-xl border p-5" data-chart-section="products">
			<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Top Products</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-surface-z2 border-b">
							<th class="text-surface-z5 pb-2 text-left text-xs font-medium uppercase">Product</th>
							<th class="text-surface-z5 pb-2 text-left text-xs font-medium uppercase">Category</th>
							<th class="text-surface-z5 pb-2 text-right text-xs font-medium uppercase">Orders</th>
							<th class="text-surface-z5 pb-2 text-right text-xs font-medium uppercase">Revenue</th>
						</tr>
					</thead>
					<tbody>
						{#each topProds as prod (prod.product)}
							<tr class="border-surface-z2 border-b">
								<td class="text-surface-z8 py-2 font-medium">{prod.product}</td>
								<td class="text-surface-z5 py-2">
									<span class="bg-surface-z3 rounded px-1.5 py-0.5 text-xs">{prod.category}</span>
								</td>
								<td class="text-surface-z6 py-2 text-right">{prod.orders}</td>
								<td class="text-surface-z8 py-2 text-right font-medium">{fmtCurrency(prod.amount)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
