<script>
	import { Stepper } from '@rokkit/ui'

	let currentStep = $state(0)

	const stepData = [
		{
			text: '1',
			label: 'Account Setup',
			completed: false,
			active: true
		},
		{
			text: '2',
			label: 'Profile Information',
			completed: false,
			active: false
		},
		{
			text: '3',
			label: 'Preferences',
			completed: false,
			active: false
		},
		{
			text: '4',
			label: 'Verification',
			completed: false,
			active: false
		},
		{
			text: '5',
			label: 'Complete',
			completed: false,
			active: false
		}
	]

	let data = $state([...stepData])
	let value = $derived(data[0])

	function nextStep() {
		if (currentStep < data.length - 1) {
			// Mark current step as completed
			data[currentStep].completed = true
			data[currentStep].active = false

			// Move to next step
			currentStep++
			data[currentStep].active = true
			value = data[currentStep]

			// Trigger reactivity
			data = [...data]
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			// Mark current step as not active
			data[currentStep].active = false

			// Move to previous step
			currentStep--
			data[currentStep].completed = false
			data[currentStep].active = true
			value = data[currentStep]

			// Trigger reactivity
			data = [...data]
		}
	}

	function reset() {
		currentStep = 0
		data = stepData.map((step, index) => ({
			...step,
			completed: false,
			active: index === 0
		}))
		value = data[0]
	}
</script>

<div class="space-y-6">
	<Stepper {data} bind:value />

	<div class="flex gap-3">
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
			onclick={prevStep}
			disabled={currentStep === 0}
		>
			Previous
		</button>
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
			onclick={nextStep}
			disabled={currentStep === data.length - 1}
		>
			Next
		</button>
		<button class="rounded bg-gray-500 px-4 py-2 text-white" onclick={reset}> Reset </button>
	</div>

	<div class="rounded bg-gray-50 p-4">
		<h4 class="mb-2 font-medium">Step {currentStep + 1} of {data.length}</h4>
		<p><strong>Current:</strong> {value?.label}</p>
		<p>
			<strong>Status:</strong>
			{value?.completed ? 'Completed' : value?.active ? 'Active' : 'Pending'}
		</p>
	</div>
</div>
