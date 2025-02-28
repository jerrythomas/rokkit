<script>
	import { Range } from '@rokkit/ui'

	let value = $state()
</script>

<Range bind:value />
<p>Selected Value: <b>{value}</b></p>
