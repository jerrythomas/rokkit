<script>
	import { InputField } from '@rokkit/form'

	let value
</script>

<InputField bind:value placeholder="value" label="Enter a value" />
<p>Selected Value: <b>{value}</b></p>
