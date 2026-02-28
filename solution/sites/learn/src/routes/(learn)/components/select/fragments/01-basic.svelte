<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const fruits = [
		{ text: 'Apple', value: 'apple' },
		{ text: 'Banana', value: 'banana' },
		{ text: 'Cherry', value: 'cherry' }
	]
	let value = $state(null)
</script>

<Select items={fruits} bind:value placeholder="Choose a fruit" />
