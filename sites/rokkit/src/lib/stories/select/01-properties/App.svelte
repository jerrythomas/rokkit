<script>
	import { Select } from '@rokkit/input'

	let items = ['Alpha ', 'Beta', 'Gamma']
	let value
</script>

<Select {items} bind:value placeholder="Select a value" />
<p>Selected Value: <b>{value}</b></p>
