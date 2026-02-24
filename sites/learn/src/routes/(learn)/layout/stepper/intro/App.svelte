<script>
	import { Stepper } from '@rokkit/ui'

	let steps = $state([
		{ text: 'Account', completed: true },
		{ text: 'Profile', completed: true },
		{ text: 'Preferences' },
		{ text: 'Review' }
	])

	let current = $state(2)

	function handleClick(step) {
		current = step
	}

	function advance() {
		steps[current] = { ...steps[current], completed: true }
		if (current < steps.length - 1) {
			current++
		}
	}
</script>

<div class="flex w-full flex-col items-center gap-6">
	<Stepper {steps} bind:current onclick={handleClick} />

	<p class="text-surface-z6 text-sm">
		Current: <strong>{steps[current].text}</strong> (Step {current + 1} of {steps.length})
	</p>

	<button class="button is-primary" onclick={advance}>
		Complete &amp; Next
	</button>
</div>
