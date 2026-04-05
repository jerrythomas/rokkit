<script>
	// @ts-nocheck
	import { sales } from '$lib/data/sales.js'

	const byRegion = (() => {
		const map = new Map()
		for (const r of sales) map.set(r.region, (map.get(r.region) ?? 0) + r.amount)
		return [...map.entries()].map(([region, revenue]) => ({ region, revenue })).sort((a, b) => b.revenue - a.revenue)
	})()

	const byMonth = (() => {
		const map = new Map()
		for (const r of sales) map.set(r.month, (map.get(r.month) ?? 0) + r.amount)
		return [...map.entries()].map(([month, revenue]) => ({ month, revenue }))
	})()

	const total = sales.reduce((s, r) => s + r.amount, 0)
	const avgMargin = (sales.reduce((s, r) => s + r.margin, 0) / sales.length * 100).toFixed(1)
	const topRegion = byRegion[0]

	function fmt(v) {
		if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
		if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
		return `$${v}`
	}
</script>

<div class="px-6 py-6 lg:px-8">
	<div class="mb-6">
		<h1 class="text-surface-z8 text-xl font-bold">Analytics</h1>
		<p class="text-surface-z5 mt-1 text-sm">Revenue breakdown by region and month</p>
	</div>

	<!-- KPI row -->
	<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4">
			<div class="text-surface-z5 text-xs uppercase tracking-wider">Total Revenue</div>
			<div class="text-surface-z8 mt-1 text-2xl font-bold">{fmt(total)}</div>
		</div>
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4">
			<div class="text-surface-z5 text-xs uppercase tracking-wider">Avg Margin</div>
			<div class="text-surface-z8 mt-1 text-2xl font-bold">{avgMargin}%</div>
		</div>
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4">
			<div class="text-surface-z5 text-xs uppercase tracking-wider">Top Region</div>
			<div class="text-surface-z8 mt-1 text-lg font-bold">{topRegion.region}</div>
			<div class="text-surface-z5 text-xs">{fmt(topRegion.revenue)}</div>
		</div>
	</div>

	<!-- Revenue by region -->
	<div class="border-surface-z2 bg-surface-z1 mb-5 rounded-xl border p-5">
		<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Revenue by Region</h3>
		<div class="flex flex-col gap-3">
			{#each byRegion as r}
				{@const pct = (r.revenue / total * 100).toFixed(1)}
				<div>
					<div class="mb-1 flex justify-between text-xs">
						<span class="text-surface-z6">{r.region}</span>
						<span class="text-surface-z7 font-medium">{fmt(r.revenue)} <span class="text-surface-z4">({pct}%)</span></span>
					</div>
					<div class="bg-surface-z3 h-2 rounded-full">
						<div class="bg-primary-z5 h-2 rounded-full" style="width:{pct}%"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Monthly trend table -->
	<div class="border-surface-z2 bg-surface-z1 rounded-xl border">
		<div class="border-surface-z2 border-b px-5 py-3">
			<h3 class="text-surface-z7 text-sm font-semibold">Monthly Revenue</h3>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-surface-z2 border-b">
						<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Month</th>
						<th class="text-surface-z5 px-5 py-2.5 text-right text-xs font-medium uppercase">Revenue</th>
					</tr>
				</thead>
				<tbody>
					{#each byMonth as r}
						<tr class="border-surface-z2 border-b last:border-0 hover:bg-surface-z2">
							<td class="text-surface-z6 px-5 py-2">{r.month}</td>
							<td class="text-surface-z8 px-5 py-2 text-right font-medium">{fmt(r.revenue)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
