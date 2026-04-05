<script>
	// @ts-nocheck
	import { sales } from '$lib/data/sales.js'

	const statuses = ['Delivered', 'In Transit', 'Processing', 'Pending', 'Cancelled']
	const statusColors = {
		Delivered: 'text-emerald-600 bg-emerald-50',
		'In Transit': 'text-sky-600 bg-sky-50',
		Processing: 'text-amber-600 bg-amber-50',
		Pending: 'text-surface-z5 bg-surface-z2',
		Cancelled: 'text-red-600 bg-red-50'
	}

	// Pseudo-assign status based on row index
	const orders = sales.slice(0, 50).map((r, i) => ({
		...r,
		status: statuses[i % statuses.length],
		orderId: `ORD-${String(r.id).padStart(4, '0')}`
	}))

	const statusCounts = statuses.map((s) => ({
		status: s,
		count: orders.filter((o) => o.status === s).length
	}))

	function fmt(v) {
		if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
		return `$${v}`
	}
</script>

<div class="px-6 py-6 lg:px-8">
	<div class="mb-6">
		<h1 class="text-surface-z8 text-xl font-bold">Operations</h1>
		<p class="text-surface-z5 mt-1 text-sm">Order pipeline and fulfillment status</p>
	</div>

	<!-- Status summary -->
	<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
		{#each statusCounts as s}
			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-3 text-center">
				<div class="text-surface-z8 text-xl font-bold">{s.count}</div>
				<div class="text-surface-z5 mt-0.5 text-xs">{s.status}</div>
			</div>
		{/each}
	</div>

	<!-- Orders table -->
	<div class="border-surface-z2 bg-surface-z1 rounded-xl border">
		<div class="border-surface-z2 border-b px-5 py-3">
			<h3 class="text-surface-z7 text-sm font-semibold">Recent Orders ({orders.length})</h3>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-surface-z2 border-b">
						<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Order</th>
						<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Date</th>
						<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Product</th>
						<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Region</th>
						<th class="text-surface-z5 px-5 py-2.5 text-right text-xs font-medium uppercase">Amount</th>
						<th class="text-surface-z5 px-5 py-2.5 text-left text-xs font-medium uppercase">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each orders as o}
						<tr class="border-surface-z2 border-b last:border-0 hover:bg-surface-z2">
							<td class="text-surface-z5 px-5 py-2 font-mono text-xs">{o.orderId}</td>
							<td class="text-surface-z6 px-5 py-2">{o.date}</td>
							<td class="text-surface-z7 px-5 py-2 font-medium">{o.product}</td>
							<td class="text-surface-z6 px-5 py-2">{o.region}</td>
							<td class="text-surface-z8 px-5 py-2 text-right font-medium">{fmt(o.amount)}</td>
							<td class="px-5 py-2">
								<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusColors[o.status]}">{o.status}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
