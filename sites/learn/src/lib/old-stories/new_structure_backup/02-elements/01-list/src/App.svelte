<script>
	import { List } from '@rokkit/ui'

	let items = $state([
		{ text: 'Fruits', description: 'Fresh and healthy', icon: '🍎' },
		{ text: 'Vegetables', description: 'Rich in vitamins', icon: '🥕' },
		{ text: 'Nuts', description: 'Protein packed', icon: '🥜' },
		{ text: 'Spices', description: 'Add flavor to dishes', icon: '🌶️' }
	])
	let value = $state(null)
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold">Interactive List Demo</h3>
	<List bind:items bind:value />
	<div class="text-sm">
		<p><strong>Selected:</strong> {value?.text || 'None'}</p>
		{#if value?.description}
			<p><strong>Description:</strong> {value.description}</p>
		{/if}
	</div>
</div>