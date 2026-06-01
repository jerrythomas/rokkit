<script>
	import { Stepper } from '@rokkit/ui'

	let steps = [{ label: 'Account', completed: true }, { label: 'Profile' }, { label: 'Review' }]
	let current = $state(1)
</script>

<Stepper {steps} bind:current onclick={(step) => (current = step)} />
