<script>
	import { Range } from '@rokkit/molecules'

	let value
</script>

<Range bind:value step={5} />
<p>Selected Value: <b>{value}</b></p>
