<script>
	// @ts-nocheck
	import { Dropdown } from '@rokkit/ui'

	const fruits = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Date', value: 'date', disabled: true },
		{ label: 'Elderberry', value: 'elderberry' }
	]

	let value = $state(null)
</script>

<Dropdown items={fruits} bind:value placeholder="Choose a fruit" />

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{value ?? 'none'}</strong></p>
