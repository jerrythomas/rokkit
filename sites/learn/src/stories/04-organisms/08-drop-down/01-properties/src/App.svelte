<script>
	import { DropDown } from '@rokkit/organisms'

	let options = ['Alpha ', 'Beta', 'Gamma']
	let value
</script>

<DropDown {options} bind:value title="Select a value" />
<p>Selected Value: <b>{value}</b></p>
