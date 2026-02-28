<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const fruits = [
		{ text: 'Apple', value: 'apple', icon: 'i-lucide:circle' },
		{ text: 'Banana', value: 'banana', icon: 'i-lucide:circle' },
		{ text: 'Cherry', value: 'cherry', icon: 'i-lucide:circle' },
		{ text: 'Date', value: 'date', icon: 'i-lucide:circle', disabled: true },
		{ text: 'Elderberry', value: 'elderberry', icon: 'i-lucide:circle' }
	]
	let value = $state(null)
</script>

<Select items={fruits} bind:value placeholder="Choose a fruit" />

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value ?? 'none'}</strong></p>
