<script>
	import { List } from '@rokkit/ui'

	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state(null)
</script>

<div class="space-y-4">
	<List {items} bind:value />
	<p class="text-surface-600 dark:text-surface-400 text-sm">
		Selected: <strong>{value || 'None'}</strong>
	</p>
</div>
