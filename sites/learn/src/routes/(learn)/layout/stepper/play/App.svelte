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
	let value = $state(data[0])
	
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
			class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" 
			onclick={prevStep}
			disabled={currentStep === 0}
		>
			Previous
		</button>
		<button 
			class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" 
			onclick={nextStep}
			disabled={currentStep === data.length - 1}
		>
			Next
		</button>
		<button 
			class="px-4 py-2 bg-gray-500 text-white rounded" 
			onclick={reset}
		>
			Reset
		</button>
	</div>
	
	<div class="p-4 bg-gray-50 rounded">
		<h4 class="font-medium mb-2">Step {currentStep + 1} of {data.length}</h4>
		<p><strong>Current:</strong> {value?.label}</p>
		<p><strong>Status:</strong> {value?.completed ? 'Completed' : value?.active ? 'Active' : 'Pending'}</p>
	</div>
</div>