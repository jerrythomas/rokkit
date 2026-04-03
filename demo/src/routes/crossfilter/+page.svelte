<script>
	// @ts-nocheck
	import { CrossFilter, FilterBar, FilterHistogram } from '@rokkit/chart'
	import { sales } from '$lib/data/sales.js'

	// ─── Aggregated data for filter charts ───────────────────────────────────────
	const regionAgg = $derived.by(() => {
		const map = new Map()
		for (const row of sales) {
			map.set(row.region, (map.get(row.region) ?? 0) + 1)
		}
		return [...map.entries()].map(([region, count]) => ({ region, count }))
	})

	const categoryAgg = $derived.by(() => {
		const map = new Map()
		for (const row of sales) {
			map.set(row.category, (map.get(row.category) ?? 0) + 1)
		}
		return [...map.entries()].map(([category, count]) => ({ category, count }))
	})

	// ─── Active filters ───────────────────────────────────────────────────────────
	let filters = $state()

	const filteredRecords = $derived.by(() => {
		if (!filters || filters.size === 0) return sales
		return sales.filter((row) => {
			for (const [dim, f] of filters) {
				if (f instanceof Set) {
					if (!f.has(row[dim])) return false
				} else if (Array.isArray(f)) {
					const [lo, hi] = f
					if (row[dim] < lo || row[dim] > hi) return false
				}
			}
			return true
		})
	})

	const summary = $derived({
		count: filteredRecords.length,
		revenue: filteredRecords.reduce((s, r) => s + r.amount, 0),
		avgOrder: filteredRecords.length > 0
			? Math.round(filteredRecords.reduce((s, r) => s + r.amount, 0) / filteredRecords.length)
			: 0
	})

	function fmtCurrency(v) {
		if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
		if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
		return `$${v}`
	}

	function fmtFilter(dim, f) {
		if (!f) return ''
		if (f instanceof Set) return [...f].join(', ')
		return `${fmtCurrency(f[0])} – ${fmtCurrency(f[1])}`
	}

	const activeFilterList = $derived(
		filters ? [...filters.entries()].map(([dim, f]) => ({ dim, label: fmtFilter(dim, f) })) : []
	)

	let page = $state(0)
	const pageSize = 12
	const pageCount = $derived(Math.ceil(filteredRecords.length / pageSize))
	const pageRecords = $derived(filteredRecords.slice(page * pageSize, (page + 1) * pageSize))

	$effect(() => {
		void filters
		page = 0
	})
</script>

<div class="px-6 py-6 lg:px-8" data-crossfilter-demo>
	<!-- ── Header ──────────────────────────────────────────────────────────────── -->
	<div class="mb-6">
		<h1 class="text-surface-z8 text-xl font-bold">Sales Crossfilter</h1>
		<p class="text-surface-z5 mt-1 text-sm">
			Click bars to filter · Drag histogram to select a range · All charts are linked
		</p>
	</div>

	<CrossFilter bind:filters mode="dim">
		<!-- ── Summary bar ──────────────────────────────────────────────────────── -->
		<div class="border-surface-z2 bg-surface-z1 mb-5 flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5">
			<span class="text-surface-z8 text-sm font-semibold">{summary.count} records</span>
			<span class="text-surface-z3 mx-1">·</span>
			<span class="text-surface-z6 text-sm">{fmtCurrency(summary.revenue)} revenue</span>
			<span class="text-surface-z3 mx-1">·</span>
			<span class="text-surface-z6 text-sm">{fmtCurrency(summary.avgOrder)} avg</span>
			{#if activeFilterList.length > 0}
				<div class="ml-auto flex flex-wrap gap-2">
					{#each activeFilterList as f (f.dim)}
						<span class="bg-surface-z3 text-surface-z7 rounded-full px-2.5 py-0.5 text-xs">
							{f.dim}: {f.label}
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ── Filter charts ──────────────────────────────────────────────────── -->
		<div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-filter-section="region">
				<h4 class="text-surface-z5 mb-3 text-xs font-semibold uppercase tracking-wider">Region</h4>
				<FilterBar data={regionAgg} field="region" valueField="count" width={280} height={130} />
			</div>
			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-filter-section="category">
				<h4 class="text-surface-z5 mb-3 text-xs font-semibold uppercase tracking-wider">Category</h4>
				<FilterBar data={categoryAgg} field="category" valueField="count" width={280} height={130} />
			</div>
			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-filter-section="amount">
				<h4 class="text-surface-z5 mb-3 text-xs font-semibold uppercase tracking-wider">Order Amount</h4>
				<FilterHistogram data={sales} field="amount" bins={25} width={280} height={130} />
			</div>
		</div>

		<div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-filter-section="profit">
				<h4 class="text-surface-z5 mb-3 text-xs font-semibold uppercase tracking-wider">Profit</h4>
				<FilterHistogram data={sales} field="profit" bins={20} width={380} height={110} />
			</div>
			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4" data-filter-section="quantity">
				<h4 class="text-surface-z5 mb-3 text-xs font-semibold uppercase tracking-wider">Quantity</h4>
				<FilterHistogram data={sales} field="quantity" bins={21} width={380} height={110} />
			</div>
		</div>

		<!-- ── Results table ──────────────────────────────────────────────────── -->
		<div class="border-surface-z2 bg-surface-z1 rounded-xl border" data-results-table>
			<div class="border-surface-z2 flex items-center justify-between border-b px-5 py-3">
				<h3 class="text-surface-z7 text-sm font-semibold">Orders ({filteredRecords.length})</h3>
				{#if pageCount > 1}
					<div class="flex items-center gap-2">
						<button
							class="border-surface-z2 text-surface-z6 hover:bg-surface-z2 rounded border px-2 py-1 text-xs disabled:opacity-30"
							disabled={page === 0}
							onclick={() => (page = Math.max(0, page - 1))}
						>← Prev</button>
						<span class="text-surface-z5 text-xs">{page + 1} / {pageCount}</span>
						<button
							class="border-surface-z2 text-surface-z6 hover:bg-surface-z2 rounded border px-2 py-1 text-xs disabled:opacity-30"
							disabled={page >= pageCount - 1}
							onclick={() => (page = Math.min(pageCount - 1, page + 1))}
						>Next →</button>
					</div>
				{/if}
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-surface-z2 border-b">
							<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Date</th>
							<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Region</th>
							<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Category</th>
							<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Product</th>
							<th class="text-surface-z5 px-5 py-2.5 text-right text-xs font-medium uppercase">Qty</th>
							<th class="text-surface-z5 px-5 py-2.5 text-right text-xs font-medium uppercase">Amount</th>
							<th class="text-surface-z5 px-5 py-2.5 text-right text-xs font-medium uppercase">Profit</th>
						</tr>
					</thead>
					<tbody>
						{#each pageRecords as row (row.id)}
							<tr class="border-surface-z2 border-b last:border-0 hover:bg-surface-z2">
								<td class="text-surface-z6 px-5 py-2">{row.date}</td>
								<td class="text-surface-z7 px-5 py-2">{row.region}</td>
								<td class="px-5 py-2">
									<span class="bg-surface-z3 text-surface-z6 rounded px-1.5 py-0.5 text-xs">{row.category}</span>
								</td>
								<td class="text-surface-z7 px-5 py-2 font-medium">{row.product}</td>
								<td class="text-surface-z6 px-5 py-2 text-right">{row.quantity}</td>
								<td class="text-surface-z8 px-5 py-2 text-right font-medium">{fmtCurrency(row.amount)}</td>
								<td class="text-surface-z6 px-5 py-2 text-right">{fmtCurrency(row.profit)}</td>
							</tr>
						{/each}
						{#if pageRecords.length === 0}
							<tr>
								<td colspan="7" class="text-surface-z4 px-5 py-8 text-center text-sm">
									No records match the current filters
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</CrossFilter>
</div>
