<script>
	import { MultiSelect } from '@rokkit/ui'

	let options = ['Alpha ', 'Beta', 'Gamma']
	let value = $state()
</script>

<MultiSelect {options} bind:value placeholder="Select multiple values" />
<p>Selected Value: <b>{JSON.stringify(value)}</b></p>
