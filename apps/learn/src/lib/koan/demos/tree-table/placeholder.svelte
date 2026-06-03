<script lang="ts">
	import { TreeTable } from '@rokkit/ui'
	import { nestByPath, nestByColumns } from '@rokkit/data'

	// ─── Shape 1 — nested rows (canonical) ────────────────────────────────────
	const nested = [
		{
			region: 'EMEA',
			sales: 1840,
			deals: 12,
			children: [
				{ region: 'EMEA / Germany', sales: 920, deals: 6 },
				{ region: 'EMEA / France', sales: 540, deals: 4 },
				{ region: 'EMEA / UK', sales: 380, deals: 2 }
			]
		},
		{
			region: 'AMER',
			sales: 2640,
			deals: 18,
			children: [
				{ region: 'AMER / USA', sales: 1820, deals: 13 },
				{ region: 'AMER / Canada', sales: 820, deals: 5 }
			]
		},
		{
			region: 'APAC',
			sales: 1320,
			deals: 9,
			children: [
				{ region: 'APAC / Japan', sales: 760, deals: 5 },
				{ region: 'APAC / Australia', sales: 560, deals: 4 }
			]
		}
	]

	// ─── Shape 2 — path-string flat rows → nestByPath ─────────────────────────
	const flatByPath = [
		{ path: 'engineering', headcount: 24 },
		{ path: 'engineering/web', headcount: 11 },
		{ path: 'engineering/web/frontend', headcount: 7 },
		{ path: 'engineering/web/backend', headcount: 4 },
		{ path: 'engineering/mobile', headcount: 9 },
		{ path: 'engineering/platform', headcount: 4 },
		{ path: 'design', headcount: 6 },
		{ path: 'design/product', headcount: 4 },
		{ path: 'design/research', headcount: 2 }
	]
	const nestedFromPath = nestByPath(flatByPath, { column: 'path' })

	// ─── Shape 3 — column-array flat rows → nestByColumns ─────────────────────
	const flatByColumns = [
		{ region: 'EMEA', country: 'France', city: 'Paris', revenue: 320 },
		{ region: 'EMEA', country: 'France', city: 'Lyon', revenue: 110 },
		{ region: 'EMEA', country: 'Germany', city: 'Berlin', revenue: 280 },
		{ region: 'EMEA', country: 'Germany', city: 'Munich', revenue: 180 },
		{ region: 'AMER', country: 'USA', city: 'NYC', revenue: 480 },
		{ region: 'AMER', country: 'USA', city: 'SF', revenue: 540 },
		{ region: 'AMER', country: 'Canada', city: 'Toronto', revenue: 220 }
	]
	const nestedFromColumns = nestByColumns(flatByColumns, ['region', 'country'])
</script>

<div data-tree-table-demo>
	<section>
		<header>
			<h3>Nested rows (canonical)</h3>
			<p>
				Pass rows with a <code>children</code> array directly. Click a region header
				to expand it. Sort by any column — siblings reorder, hierarchy is preserved.
			</p>
		</header>
		<TreeTable
			data={nested}
			caption="Sales by region"
			columns={[
				{ name: 'region', label: 'Region', hierarchy: true },
				{ name: 'sales', label: 'Sales ($k)', align: 'right' },
				{ name: 'deals', label: 'Deals', align: 'right' }
			]}
		/>
	</section>

	<section>
		<header>
			<h3>From a path-string flat list</h3>
			<p>
				Flat rows with a separator-delimited path field — pass through
				<code>nestByPath()</code> to turn them into nested children.
			</p>
		</header>
		<TreeTable
			data={nestedFromPath}
			caption="Headcount by team"
			columns={[
				{ name: 'path', label: 'Team', hierarchy: true },
				{ name: 'headcount', label: 'People', align: 'right' }
			]}
		/>
	</section>

	<section>
		<header>
			<h3>From group-by columns</h3>
			<p>
				Flat rows that should be grouped by one or more columns — pass through
				<code>nestByColumns(rows, ['region', 'country'])</code>. Synthetic group
				rows carry a <code>__group</code> flag.
			</p>
		</header>
		<TreeTable
			data={nestedFromColumns}
			caption="Revenue by region → country → city"
			columns={[
				{ name: 'region', label: 'Region', hierarchy: true },
				{ name: 'country', label: 'Country' },
				{ name: 'city', label: 'City' },
				{ name: 'revenue', label: 'Revenue ($k)', align: 'right' }
			]}
		/>
	</section>
</div>

<style>
	[data-tree-table-demo] {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}
	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	h3 {
		margin: 0;
		font-size: var(--text-md);
		font-weight: var(--font-weight-medium);
	}
	p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-soft);
	}
	code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		padding: 0 0.25em;
		background: var(--paper-soft);
		border-radius: var(--radius-sm);
	}
</style>
