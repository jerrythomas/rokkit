<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const fruits = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' }
	]
	let value = $state(null)
</script>

<Select options={fruits} bind:value placeholder="Choose a fruit" />
