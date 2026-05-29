<script lang="ts">
	import { Table } from '@rokkit/ui'

	const data = [
		{ name: 'Laptop', price: 1299, stock: 45 },
		{ name: 'Phone', price: 899, stock: 120 },
		{ name: 'Tablet', price: 599, stock: 78 },
		{ name: 'Monitor', price: 449, stock: 32 },
		{ name: 'Keyboard', price: 129, stock: 210 },
		{ name: 'Mouse', price: 59, stock: 340 }
	]
</script>

<Table {data} caption="Products" />
