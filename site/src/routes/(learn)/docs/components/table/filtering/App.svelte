<script>
	// @ts-nocheck
	import { Table, SearchFilter } from '@rokkit/ui'
	import { filterData } from '@rokkit/data'

	const employees = [
		{ name: 'Alice Johnson', age: 28, department: 'Engineering', salary: 95000 },
		{ name: 'Bob Smith', age: 35, department: 'Design', salary: 88000 },
		{ name: 'Charlie Brown', age: 22, department: 'Engineering', salary: 72000 },
		{ name: 'Diana Prince', age: 31, department: 'Marketing', salary: 91000 },
		{ name: 'Eve Wilson', age: 27, department: 'Design', salary: 85000 },
		{ name: 'Frank Miller', age: 42, department: 'Engineering', salary: 115000 }
	]

	let filters = $state([])
	const filtered = $derived(filters.length > 0 ? filterData(employees, filters) : employees)
</script>

<SearchFilter bind:filters placeholder="e.g. name:alice department:eng salary>90000" />
<Table data={filtered} caption="Filtered Employees" striped />

<p class="text-surface-z6 mt-2 text-sm">
	Try: <code>name:alice</code>, <code>salary>90000</code>, <code>department:eng</code>, or just type
	free text to search all columns.
</p>
