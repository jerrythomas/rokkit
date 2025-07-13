<script>
	import { Range } from '@rokkit/ui'

	let value = $state(50)
</script>

<Range bind:value />
<p>Selected Value: <b>{value}</b></p>