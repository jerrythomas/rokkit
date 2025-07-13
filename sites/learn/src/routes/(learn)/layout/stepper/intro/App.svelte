<script>
	import { Stepper } from '@rokkit/ui'
	
	const data = [
		{
			text: '01',
			label: 'Personal Info',
			completed: true,
			active: false
		},
		{
			text: '02',
			label: 'Contact Details',
			completed: true,
			active: false
		},
		{
			text: '03',
			label: 'Preferences',
			active: true
		},
		{
			text: '04',
			label: 'Review',
			disabled: true
		},
		{
			text: '05',
			label: 'Complete',
			disabled: true
		}
	]
	
	let value = $state(data[2]) // Currently on step 3
</script>

<Stepper {data} bind:value />

<div class="mt-6 p-4 bg-gray-50 rounded">
	<h4 class="font-medium">Current Stage:</h4>
	<pre class="text-sm mt-2">{JSON.stringify(value, null, 2)}</pre>
</div>