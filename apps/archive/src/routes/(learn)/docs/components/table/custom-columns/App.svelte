<script>
	// @ts-nocheck
	import { Table } from '@rokkit/ui'

	const employees = [
		{ name: 'Alice Johnson', age: 28, department: 'Engineering', salary: 95000 },
		{ name: 'Bob Smith', age: 35, department: 'Design', salary: 88000 },
		{ name: 'Charlie Brown', age: 22, department: 'Engineering', salary: 72000 },
		{ name: 'Diana Prince', age: 31, department: 'Marketing', salary: 91000 },
		{ name: 'Eve Wilson', age: 27, department: 'Design', salary: 85000 }
	]

	const columns = [
		{ name: 'name', label: 'Employee', width: '200px' },
		{ name: 'department', label: 'Dept' },
		{
			name: 'salary',
			label: 'Annual Salary',
			align: 'right',
			formatter: (v) => `$${Number(v).toLocaleString()}`
		},
		{
			name: 'age',
			label: 'Age',
			align: 'center',
			sortable: false
		}
	]
</script>

<Table data={employees} {columns} caption="Team" striped />

<p class="text-surface-z6 mt-2 text-sm">
	Custom columns with labels, width, alignment, and a salary formatter. The Age column has sorting
	disabled.
</p>
