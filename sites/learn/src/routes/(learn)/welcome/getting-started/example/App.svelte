<script>
	import { List } from '@rokkit/ui'

	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state(null)
</script>

<div class="space-y-4">
	<List {items} bind:value />
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		Selected: <strong>{value || 'None'}</strong>
	</p>
</div>
