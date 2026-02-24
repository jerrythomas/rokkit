<script>
	import { Table } from '@rokkit/ui'

	const products = [
		{ name: 'Laptop', price: 1299, stock: 45 },
		{ name: 'Phone', price: 899, stock: 120 },
		{ name: 'Tablet', price: 599, stock: 78 },
		{ name: 'Monitor', price: 449, stock: 32 },
		{ name: 'Keyboard', price: 129, stock: 210 },
		{ name: 'Mouse', price: 59, stock: 340 }
	]

	let sortState = $state([])
</script>

<Table data={products} caption="Products" onsort={(s) => (sortState = s)} />

<p class="text-surface-z6 mt-2 text-sm">
	Click a column header to sort. Click again to reverse. Hold Shift to sort by multiple columns.
</p>

{#if sortState.length > 0}
	<p class="text-surface-z7 mt-2 text-sm">
		Sort: {sortState.map((s) => `${s.column} ${s.direction}`).join(', ')}
	</p>
{/if}
