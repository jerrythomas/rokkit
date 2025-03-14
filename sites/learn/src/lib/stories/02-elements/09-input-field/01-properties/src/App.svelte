<script>
	import { InputField } from '@rokkit/ui'

	let value = $state()
</script>

<InputField bind:value label="Enter a value" />
<p>Selected Value: <b>{value}</b></p>
