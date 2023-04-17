<script>
	import { MultiSelect } from '@rokkit/input'

	let items = ['Alpha ', 'Beta', 'Gamma']
	let value
</script>

<MultiSelect {items} bind:value placeholder="Select multiple values" />
<p>Selected Value: <b>{JSON.stringify(value)}</b></p>
