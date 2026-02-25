<script>
	import { Toggle } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'

	let options = ['Small', 'Medium', 'Large']
	let value = $state('Medium')

	let config = $state({
		showLabels: true,
		disabled: false
	})

	const schema = {
		showLabels: { type: 'boolean', label: 'Show Labels' },
		disabled: { type: 'boolean', label: 'Disabled' }
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ field: 'showLabels', scope: '#/showLabels' },
			{ field: 'disabled', scope: '#/disabled' }
		]
	}

	function handleConfigUpdate(newData) {
		config = { ...newData }
	}
</script>

<div class="flex gap-8">
	<div class="flex-1">
		<Toggle {options} bind:value showLabels={config.showLabels} disabled={config.disabled} />

		<p class="text-surface-z7 mt-4">
			Selected: <strong>{value}</strong>
		</p>
	</div>

	<div class="w-[30ch]">
		<h3 class="mb-2 text-sm font-semibold">Configuration</h3>
		<FormRenderer data={config} {schema} {layout} onupdate={handleConfigUpdate} />
	</div>
</div>
