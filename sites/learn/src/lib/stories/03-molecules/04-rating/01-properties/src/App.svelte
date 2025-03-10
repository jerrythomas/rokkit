<script>
	import { Rating } from '@rokkit/ui'

	let value = $state(0)
</script>

<Rating bind:value />
<p>Selected Value: <b>{value}</b></p>
