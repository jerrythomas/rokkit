<script>
	import { Range } from '@rokkit/ui'

	let value = $state()
</script>

<Range bind:value step={5} />
<p>Selected Value: <b>{value}</b></p>
