<script>
	import { Dropdown } from '@rokkit/ui'

	const items = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' }
	]

	let value = $state(null)
</script>

<Dropdown {items} bind:value placeholder="Choose a fruit" />
