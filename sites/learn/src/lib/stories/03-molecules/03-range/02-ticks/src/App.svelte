<script>
	import { Range } from '@rokkit/elements'

	let value = $state(0)
</script>

<Range bind:value step={5} />
<p>Selected Value: <b>{value}</b></p>
