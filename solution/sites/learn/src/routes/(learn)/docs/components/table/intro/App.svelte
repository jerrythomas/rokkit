<script>
	// @ts-nocheck
	import { Table } from '@rokkit/ui'

	const employees = [
		{ id: 1, name: 'Alice Johnson', age: 28, department: 'Engineering' },
		{ id: 2, name: 'Bob Smith', age: 35, department: 'Design' },
		{ id: 3, name: 'Charlie Brown', age: 22, department: 'Engineering' },
		{ id: 4, name: 'Diana Prince', age: 31, department: 'Marketing' },
		{ id: 5, name: 'Eve Wilson', age: 27, department: 'Design' }
	]
	let value = $state(null)
</script>

<Table data={employees} caption="Employees" onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z7 mt-4 text-sm">
		Selected: <strong>{value.name}</strong>
	</p>
{/if}
