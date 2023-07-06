<script>
	import { InputField } from '@rokkit/molecules'

	let value
</script>

<InputField bind:value label="Enter a value" />
<p>Selected Value: <b>{value}</b></p>
