<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

	const items = [
		{ name: 'Fruits', category: 'food' },
		{ name: 'Vegetables', category: 'food' },
		{ name: 'Beverages', category: 'drink' },
		{ name: 'Snacks', category: 'food' }
	]
	const fields = { label: 'name' }
	let value = $state([])
</script>

<div class="w-[300px]">
	<MultiSelect {items} {fields} bind:value placeholder="Choose categories" />
</div>

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{JSON.stringify(value)}</strong></p>
