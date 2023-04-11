<script>
	import { DropDown } from '@rokkit/core'

	let items = ['Alpha ', 'Beta', 'Gamma']
	let value
</script>

<DropDown {items} bind:value title="Select a value" />
<p>Selected Value: <b>{value}</b></p>
