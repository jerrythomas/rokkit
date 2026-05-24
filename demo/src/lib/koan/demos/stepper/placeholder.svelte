<script lang="ts">
	import { Stepper, Button } from '@rokkit/ui'

	let steps = $state([
		{ label: 'Account', completed: true },
		{ label: 'Profile', completed: true },
		{ label: 'Preferences' },
		{ label: 'Review' }
	])
	let current = $state(2)

	function advance() {
		steps[current] = { ...steps[current], completed: true }
		if (current < steps.length - 1) current++
	}
</script>

<Stepper {steps} bind:current onclick={(i: number) => (current = i)} />
<Button onclick={advance}>Complete &amp; Next</Button>
