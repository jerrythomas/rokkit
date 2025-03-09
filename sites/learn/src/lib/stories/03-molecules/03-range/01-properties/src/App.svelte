<script>
	import { Range } from '@rokkit/elements'

	let value = $state(null)
</script>

<Range bind:value />
<p>Selected Value: <b>{value}</b></p>
