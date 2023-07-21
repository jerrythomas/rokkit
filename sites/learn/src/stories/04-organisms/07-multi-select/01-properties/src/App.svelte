<script>
	import { MultiSelect } from '@rokkit/organisms'

	let options = ['Alpha ', 'Beta', 'Gamma']
	let value
</script>

<MultiSelect {options} bind:value placeholder="Select multiple values" />
<p>Selected Value: <b>{JSON.stringify(value)}</b></p>
