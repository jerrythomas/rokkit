<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const fruits = [
		{ label: 'Apple', value: 'apple', icon: 'i-lucide:circle' },
		{ label: 'Banana', value: 'banana', icon: 'i-lucide:circle' },
		{ label: 'Cherry', value: 'cherry', icon: 'i-lucide:circle' },
		{ label: 'Date', value: 'date', icon: 'i-lucide:circle', disabled: true },
		{ label: 'Elderberry', value: 'elderberry', icon: 'i-lucide:circle' }
	]
	let value = $state(null)
</script>

<Select items={fruits} bind:value placeholder="Choose a fruit" />

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{value ?? 'none'}</strong></p>
