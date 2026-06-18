<script lang="ts">
	import { Stepper, Button } from '@rokkit/ui'
	import type { StepperStep } from '@rokkit/ui'

	let steps = $state<StepperStep[]>([
		{ text: 'Account', completed: true },
		{ text: 'Profile', completed: true },
		{ text: 'Preferences' },
		{ text: 'Review' }
	])
	let current = $state(2)

	function advance() {
		steps[current] = { ...steps[current], completed: true }
		if (current < steps.length - 1) current++
	}
</script>

<Stepper {steps} bind:current onclick={(i: number) => (current = i)} />
<Button onclick={advance}>Complete &amp; Next</Button>
