<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

	const items = [
		{ name: 'Fruits', category: 'food' },
		{ name: 'Vegetables', category: 'food' }
	]
	const fields = { text: 'name' }
	let value = $state([])
</script>

<MultiSelect {items} {fields} bind:value />
