<script>
	import { Table } from '@rokkit/ui'
	
	const data = [
		{ name: 'John Doe', gender: 'M', age: 25, city: 'New York', salary: 65000 },
		{ name: 'Jane Doe', gender: 'F', age: 22, city: 'Los Angeles', salary: 58000 },
		{ name: 'John Smith', gender: 'M', age: 30, city: 'Chicago', salary: 72000 },
		{ name: 'Alice Johnson', gender: 'F', age: 28, city: 'Boston', salary: 69000 }
	]
	
	const columns = [
		{ name: 'name', label: 'Person', sortable: true },
		{ name: 'city', label: 'Residing in' },
		{ name: 'gender', label: 'Gender', formatter: (value) => (value === 'M' ? 'Male' : 'Female') },
		{ name: 'salary', label: 'Annual Salary', formatter: (value) => `$${value.toLocaleString()}` }
	]
</script>

<Table {data} {columns} caption="Employee Information with Custom Formatting" />