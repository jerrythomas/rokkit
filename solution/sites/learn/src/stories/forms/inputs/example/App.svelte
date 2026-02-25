<script>
	import { List, Select, MultiSelect } from '@rokkit/ui'

	// Form data
	let formData = $state({
		category: null,
		priority: null,
		tags: [],
		assignees: []
	})

	// Sample data for different input types
	let categories = $state([
		{ id: 'bug', text: 'Bug Report', icon: '🐛', color: 'red' },
		{ id: 'feature', text: 'Feature Request', icon: '✨', color: 'blue' },
		{ id: 'improvement', text: 'Improvement', icon: '⚡', color: 'yellow' },
		{ id: 'documentation', text: 'Documentation', icon: '📚', color: 'green' }
	])

	let priorities = $state([
		{ value: 'low', label: 'Low Priority', description: 'Can be addressed later' },
		{ value: 'medium', label: 'Medium Priority', description: 'Should be addressed soon' },
		{ value: 'high', label: 'High Priority', description: 'Needs immediate attention' },
		{ value: 'urgent', label: 'Urgent', description: 'Critical issue requiring immediate fix' }
	])

	let availableTags = $state([
		{ id: 'frontend', name: 'Frontend', color: 'blue' },
		{ id: 'backend', name: 'Backend', color: 'green' },
		{ id: 'database', name: 'Database', color: 'purple' },
		{ id: 'api', name: 'API', color: 'orange' },
		{ id: 'ui', name: 'User Interface', color: 'pink' },
		{ id: 'performance', name: 'Performance', color: 'red' }
	])

	let teamMembers = $state([
		{ id: 1, name: 'Alice Johnson', role: 'Frontend Developer', avatar: '👩‍💻' },
		{ id: 2, name: 'Bob Smith', role: 'Backend Developer', avatar: '👨‍💻' },
		{ id: 3, name: 'Carol Davis', role: 'UI/UX Designer', avatar: '👩‍🎨' },
		{ id: 4, name: 'David Wilson', role: 'DevOps Engineer', avatar: '👨‍🔧' }
	])

	// Field mappings for different components
	let categoryFields = $state({ text: 'text', icon: 'icon' })
	let priorityFields = $state({ text: 'label', description: 'description' })
	let tagFields = $state({ text: 'name', id: 'id' })
	let assigneeFields = $state({ text: 'name', description: 'role', icon: 'avatar' })
</script>

<div class="mx-auto max-w-2xl space-y-8">
	<div class="text-center">
		<h2 class="text-surface-900 mb-2 text-2xl font-bold dark:text-white">Issue Tracker Form</h2>
		<p class="text-surface-600 dark:text-surface-400">
			Explore different input components with field mapping and data binding
		</p>
	</div>

	<div class="space-y-6">
		<!-- Category Selection (List) -->
		<div class="space-y-2">
			<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
				Issue Category
			</label>
			<List
				items={categories}
				bind:value={formData.category}
				fields={categoryFields}
				class="grid grid-cols-2 gap-2"
			/>
		</div>

		<!-- Priority Selection (Select) -->
		<div class="space-y-2">
			<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
				Priority Level
			</label>
			<Select
				items={priorities}
				bind:value={formData.priority}
				fields={priorityFields}
				placeholder="Select priority level..."
			/>
		</div>

		<!-- Tags (MultiSelect) -->
		<div class="space-y-2">
			<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium"> Tags </label>
			<MultiSelect
				items={availableTags}
				bind:value={formData.tags}
				fields={tagFields}
				placeholder="Select relevant tags..."
			/>
		</div>

		<!-- Assignees (MultiSelect with custom rendering) -->
		<div class="space-y-2">
			<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
				Assign to Team Members
			</label>
			<MultiSelect
				items={teamMembers}
				bind:value={formData.assignees}
				fields={assigneeFields}
				placeholder="Select team members..."
			/>
		</div>
	</div>

	<!-- Form Summary -->
	<div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-6">
		<h3 class="text-surface-900 mb-4 text-lg font-semibold dark:text-white">Form Summary</h3>

		<div class="space-y-3 text-sm">
			<div class="flex items-center justify-between">
				<span class="text-surface-600 dark:text-surface-400">Category:</span>
				<span class="text-surface-900 font-medium dark:text-white">
					{formData.category
						? `${formData.category.icon} ${formData.category.text}`
						: 'Not selected'}
				</span>
			</div>

			<div class="flex items-center justify-between">
				<span class="text-surface-600 dark:text-surface-400">Priority:</span>
				<span class="text-surface-900 font-medium dark:text-white">
					{formData.priority?.label || 'Not selected'}
				</span>
			</div>

			<div class="flex items-start justify-between">
				<span class="text-surface-600 dark:text-surface-400">Tags:</span>
				<div class="flex max-w-xs flex-wrap gap-1">
					{#each formData.tags as tag}
						<span
							class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded px-2 py-1 text-xs"
						>
							{tag.name}
						</span>
					{:else}
						<span class="font-medium text-surface-900 dark:text-white">None selected</span>
					{/each}
				</div>
			</div>

			<div class="flex items-start justify-between">
				<span class="text-surface-600 dark:text-surface-400">Assignees:</span>
				<div class="max-w-xs space-y-1">
					{#each formData.assignees as assignee}
						<div class="flex items-center space-x-2 text-xs">
							<span>{assignee.avatar}</span>
							<span class="text-surface-900 font-medium dark:text-white">{assignee.name}</span>
						</div>
					{:else}
						<span class="font-medium text-surface-900 dark:text-white">None assigned</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
