<script>
	// @ts-nocheck
	import { Tree, Select, Button, Toolbar } from '@rokkit/ui'

	const statusOptions = [
		{ label: 'All Status', value: '' },
		{ label: 'Active', value: 'active' },
		{ label: 'Blocked', value: 'blocked' },
		{ label: 'Done', value: 'done' }
	]

	const assigneeOptions = [
		{ label: 'Anyone', value: '' },
		{ label: 'Alice', value: 'alice' },
		{ label: 'Bob', value: 'bob' },
		{ label: 'Carol', value: 'carol' }
	]

	let filterStatus = $state('')
	let filterAssignee = $state('')

	const projects = [
		{
			label: 'Auth Module',
			icon: 'i-glyph:shield',
			children: [
				{ label: 'OAuth integration', icon: 'i-glyph:check-circle' },
				{ label: 'Session management', icon: 'i-glyph:clock-circle' },
				{ label: 'Rate limiting', icon: 'i-glyph:add-circle' }
			]
		},
		{
			label: 'Payments',
			icon: 'i-glyph:card',
			children: [
				{ label: 'Stripe integration', icon: 'i-glyph:check-circle' },
				{ label: 'Invoice generation', icon: 'i-glyph:clock-circle' }
			]
		},
		{
			label: 'Notifications',
			icon: 'i-glyph:bell',
			children: [
				{ label: 'Email templates', icon: 'i-glyph:clock-circle' },
				{ label: 'Push notifications', icon: 'i-glyph:add-circle' }
			]
		}
	]

	let selectedTask = $state(null)
	const treeFields = { label: 'label', icon: 'icon', value: 'label' }
	const selectFields = { label: 'label', value: 'value' }
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-surface-z8 text-2xl font-bold">Projects</h1>
		<Toolbar>
			<Button label="New Task" icon="i-glyph:add-circle" variant="primary" />
		</Toolbar>
	</div>

	<!-- Filters -->
	<Toolbar>
		<Select items={statusOptions} bind:value={filterStatus} fields={selectFields} />
		<Select items={assigneeOptions} bind:value={filterAssignee} fields={selectFields} />
	</Toolbar>

	<!-- Task tree + detail panel -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div data-card class="p-4">
			<h2 class="text-surface-z7 mb-3 text-sm font-semibold">Tasks</h2>
			<Tree items={projects} fields={treeFields} collapsible bind:value={selectedTask} />
		</div>

		<div data-card class="p-4">
			{#if selectedTask}
				<h2 class="text-surface-z7 mb-4 text-sm font-semibold">Task Detail</h2>
				<div class="flex flex-col gap-3">
					<p class="text-surface-z8 font-medium">{selectedTask}</p>
					<p class="text-surface-z5 text-sm">Inline editing with FormRenderer coming soon.</p>
				</div>
			{:else}
				<div class="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
					<span class="i-glyph:cursor text-surface-z3 text-3xl" aria-hidden="true"></span>
					<p class="text-surface-z5 text-sm">Select a task to view details</p>
				</div>
			{/if}
		</div>
	</div>
</div>
