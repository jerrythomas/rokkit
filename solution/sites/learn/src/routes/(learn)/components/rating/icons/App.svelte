<script>
	// @ts-nocheck
	import { Rating } from '@rokkit/ui'

	let value = $state(2)
	const stateIcons = {
		filled: 'i-rokkit:heart-filled',
		empty: 'i-rokkit:heart-outlined'
	}
</script>

<Rating bind:value {stateIcons} max={5} />
<p>Selected Value: <b>{value}</b></p>