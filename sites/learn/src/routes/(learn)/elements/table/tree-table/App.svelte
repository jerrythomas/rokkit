<script>
	import { Table } from '@rokkit/ui'
	
	const data = [
		{ name: 'Smith Family', lineage: '/Smith', age: 90, role: 'Patriarch' },
		{ name: 'Bob Smith', lineage: '/Smith/Bob', age: 20, role: 'Son' },
		{ name: 'Alice Smith', lineage: '/Smith/Alice', age: 55, role: 'Daughter' },
		{ name: 'Lexi Smith', lineage: '/Smith/Alice/Lexi', age: 30, role: 'Granddaughter' },
		{ name: 'Sofia Smith', lineage: '/Smith/Alice/Sofia', age: 25, role: 'Granddaughter' },
		{ name: 'Snow Family', lineage: '/Snow', age: 80, role: 'Matriarch' },
		{ name: 'Charlie Snow', lineage: '/Snow/Charlie', age: 35, role: 'Son' },
		{ name: 'Eve Snow', lineage: '/Snow/Eve', age: 40, role: 'Daughter' }
	]
</script>

<Table {data} hierarchyField="lineage" caption="Family Tree Structure" />