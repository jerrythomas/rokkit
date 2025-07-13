<script>
	import { MultiSelect } from '@rokkit/ui'
	
	const options = [
		{ name: 'Fruits', category: 'food' },
		{ name: 'Vegetables', category: 'food' },
		{ name: 'Beverages', category: 'drink' },
		{ name: 'Snacks', category: 'food' }
	]

	let fields = { text: 'name' }
	let value = $state([])
</script>

<MultiSelect {options} {fields} bind:value placeholder="Choose categories" />

<div class="mt-4">
	<p><strong>Selected Categories:</strong></p>
	<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
</div>