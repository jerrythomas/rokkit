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
			icon: 'i-solar:shield-bold-duotone',
			children: [
				{ label: 'OAuth integration', icon: 'i-solar:check-circle-bold-duotone' },
				{ label: 'Session management', icon: 'i-solar:clock-circle-bold-duotone' },
				{ label: 'Rate limiting', icon: 'i-solar:add-circle-bold-duotone' }
			]
		},
		{
			label: 'Payments',
			icon: 'i-solar:card-bold-duotone',
			children: [
				{ label: 'Stripe integration', icon: 'i-solar:check-circle-bold-duotone' },
				{ label: 'Invoice generation', icon: 'i-solar:clock-circle-bold-duotone' }
			]
		},
		{
			label: 'Notifications',
			icon: 'i-solar:bell-bold-duotone',
			children: [
				{ label: 'Email templates', icon: 'i-solar:clock-circle-bold-duotone' },
				{ label: 'Push notifications', icon: 'i-solar:add-circle-bold-duotone' }
			]
		}
	]

	let selectedTask = $state(null)
	const treeFields = { label: 'label', icon: 'icon', value: 'label' }
	const selectFields = { label: 'label', value: 'value' }
</script>

<div class="p-6 flex flex-col gap-6">
	<div class="flex items-center justify-between flex-wrap gap-3">
		<h1 class="text-2xl font-bold text-surface-z8">Projects</h1>
		<Toolbar>
			<Button label="New Task" icon="i-solar:add-circle-bold-duotone" variant="primary" />
		</Toolbar>
	</div>

	<!-- Filters -->
	<Toolbar>
		<Select items={statusOptions} bind:value={filterStatus} fields={selectFields} />
		<Select items={assigneeOptions} bind:value={filterAssignee} fields={selectFields} />
	</Toolbar>

	<!-- Task tree + detail panel -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div data-card class="p-4">
			<h2 class="text-sm font-semibold text-surface-z7 mb-3">Tasks</h2>
			<Tree
				items={projects}
				fields={treeFields}
				collapsible
				bind:value={selectedTask}
			/>
		</div>

		<div data-card class="p-4">
			{#if selectedTask}
				<h2 class="text-sm font-semibold text-surface-z7 mb-4">Task Detail</h2>
				<div class="flex flex-col gap-3">
					<p class="text-surface-z8 font-medium">{selectedTask}</p>
					<p class="text-sm text-surface-z5">Inline editing with FormRenderer coming soon.</p>
				</div>
			{:else}
				<div class="h-full flex flex-col items-center justify-center gap-2 text-center min-h-40">
					<span class="i-solar:cursor-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
					<p class="text-sm text-surface-z5">Select a task to view details</p>
				</div>
			{/if}
		</div>
	</div>
</div>
