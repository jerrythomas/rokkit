<script>
	import { Rating } from '@rokkit/input'

	let value
	const stateIcons = {
		filled: 'i-rokkit:heart-filled',
		empty: 'i-rokkit:heart-outlined'
	}
</script>

<Rating bind:value {stateIcons} />
<p>Selected Value: <b>{value}</b></p>
