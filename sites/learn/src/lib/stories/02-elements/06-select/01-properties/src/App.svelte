<script>
	import { Select } from '@rokkit/ui'

	let options = ['Alpha ', 'Beta', 'Gamma']
	let value = $state()
</script>

<Select {options} bind:value placeholder="Select a value" />
<p>Selected Value: <b>{value}</b></p>
