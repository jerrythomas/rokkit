<script>
	import { Table } from '@rokkit/ui'
	const data = [
		{ name: 'Smith', lineage: '/Smith', age: 90 },
		{ name: 'Bob', lineage: '/Smith/Bob', age: 20 },
		{ name: 'Alice', lineage: '/Smith/Alice', age: 55 },
		{ name: 'Lexi', lineage: '/Smith/Alice/Lexi', age: 30 },
		{ name: 'Sofia', lineage: '/Smith/Alice/Sofia', age: 25 },
		{ name: 'Snow', lineage: '/Snow', age: 80 },
		{ name: 'Charlie', lineage: '/Snow/Charlie', age: 35 },
		{ name: 'Eve', lineage: '/Snow/Eve', age: 40 }
	]
</script>

<Table {data} hierarchyField="lineage" />
