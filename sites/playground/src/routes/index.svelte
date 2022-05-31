<script>
	import StepperDemo from '../pages/stepper/index.svelte'

	export let data = [
		{ label: 'Account Holder Detail', progress: 1 },
		{ label: 'Vehicle Detail', progress: 0.6 },
		{ label: 'Vehicle Usage', progress: 0 },
		{ label: 'Additional Drivers', progress: 0 },
		{ label: 'Summary', progress: 0 }
	]
</script>

<StepperDemo {data} />
