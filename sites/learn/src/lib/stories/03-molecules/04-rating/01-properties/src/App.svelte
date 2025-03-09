<script>
	import { Rating } from '@rokkit/elements'

	let value = $state(0)
</script>

<Rating bind:value />
<p>Selected Value: <b>{value}</b></p>
