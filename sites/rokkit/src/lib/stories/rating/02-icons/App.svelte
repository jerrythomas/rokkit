<script>
	import { Rating } from '@rokkit/input'

	let value
	const stateIcons = {
		filled: 'i-spice:heart-filled',
		empty: 'i-spice:heart-outlined'
	}
</script>

<Rating bind:value {stateIcons} />
<p>Selected Value: <b>{value}</b></p>
