<script>
	import { Table } from '@rokkit/ui'
	const data = [
		{ name: 'John Doe', gender: 'M', age: 25, city: 'New York' },
		{ name: 'Jane Doe', gender: 'F', age: 22, city: 'Los Angeles' },
		{ name: 'John Smith', gender: 'M', age: 30, city: 'Chicago' }
	]
	const columns = [
		{ name: 'name', label: 'Person', sortable: true },
		{ name: 'city', label: 'Residing in' },
		{ name: 'gender', label: 'Gender', formatter: (value) => (value === 'M' ? 'Male' : 'Female') }
	]
</script>

<Table {data} {columns} />
