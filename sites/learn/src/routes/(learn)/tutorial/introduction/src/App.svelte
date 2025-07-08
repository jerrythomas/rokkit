<script>
	import { List } from '@rokkit/ui'

	let items = $state([
		{ text: 'Welcome to Rokkit', icon: '👋', description: 'A modern Svelte UI library' },
		{ text: 'Data-Driven Components', icon: '🚀', description: 'Components that work with your data' },
		{ text: 'Easy to Use', icon: '⚡', description: 'Simple APIs and great developer experience' },
		{ text: 'Fully Customizable', icon: '🎨', description: 'Theme and style to match your brand' }
	])

	let value = $state(null)
	let fields = $state({ text: 'text', icon: 'icon' })
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
			Welcome to Rokkit!
		</h2>
		<p class="text-neutral-600 dark:text-neutral-400">
			Click on any item below to see how data-driven components work
		</p>
	</div>

	<div class="max-w-md mx-auto">
		<List bind:items bind:value {fields} />
	</div>

	{#if value}
		<div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
			<div class="text-2xl mb-2">{value.icon}</div>
			<h3 class="font-semibold text-primary-900 dark:text-primary-100 mb-1">
				{value.text}
			</h3>
			<p class="text-sm text-primary-700 dark:text-primary-300">
				{value.description}
			</p>
		</div>
	{:else}
		<div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
			<p class="text-neutral-600 dark:text-neutral-400">
				Select an item above to see its details
			</p>
		</div>
	{/if}
</div>
