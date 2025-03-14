<script>
	import { InputField } from '@rokkit/ui'

	let value = $state()
</script>

<InputField bind:value nolabel />
<p>Selected Value: <b>{value}</b></p>
