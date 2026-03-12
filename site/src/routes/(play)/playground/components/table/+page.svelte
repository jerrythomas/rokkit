<script>
	// @ts-nocheck
	import { Table, SearchFilter } from '@rokkit/ui'
	import { filterData } from '@rokkit/data'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state(undefined)
	let filters = $state([])

	let props = $state({ caption: 'Employees', size: 'md', striped: false, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			caption: { type: 'string' },
			size: { type: 'string' },
			striped: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/caption', label: 'Caption' },
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/striped', label: 'Striped' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const employees = [
		{ id: 1, name: 'Alice Johnson', age: 28, department: 'Engineering', salary: 95000 },
		{ id: 2, name: 'Bob Smith', age: 35, department: 'Design', salary: 88000 },
		{ id: 3, name: 'Charlie Brown', age: 22, department: 'Engineering', salary: 72000 },
		{ id: 4, name: 'Diana Prince', age: 31, department: 'Marketing', salary: 91000 },
		{ id: 5, name: 'Eve Wilson', age: 27, department: 'Design', salary: 85000 },
		{ id: 6, name: 'Frank Miller', age: 42, department: 'Engineering', salary: 115000 },
		{ id: 7, name: 'Grace Lee', age: 29, department: 'Marketing', salary: 78000 },
		{ id: 8, name: 'Henry Adams', age: 38, department: 'Engineering', salary: 105000 }
	]

	const customColumns = [
		{ name: 'name', label: 'Employee', width: '200px' },
		{ name: 'department', label: 'Dept' },
		{
			name: 'salary',
			label: 'Annual Salary',
			align: 'right',
			formatter: (v) => `$${Number(v).toLocaleString()}`
		}
	]

	const filtered = $derived(filters.length > 0 ? filterData(employees, filters) : employees)
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">
					Auto-derived columns
				</h4>
				<Table
					data={employees}
					caption={props.caption}
					size={props.size}
					striped={props.striped}
					disabled={props.disabled}
					bind:value
					onselect={(v) => (value = v)}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">
					Custom columns + formatter
				</h4>
				<Table
					data={employees}
					columns={customColumns}
					caption="Team"
					size={props.size}
					striped={props.striped}
					disabled={props.disabled}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">With SearchFilter</h4>
				<div class="mb-2">
					<SearchFilter bind:filters placeholder="e.g. name:alice department:eng salary>90000" />
				</div>
				<Table
					data={filtered}
					caption="Filtered"
					size={props.size}
					striped={props.striped}
					disabled={props.disabled}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" {value} />
	{/snippet}
</PlaySection>
