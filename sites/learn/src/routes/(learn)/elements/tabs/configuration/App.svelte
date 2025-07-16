<script>
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'

	let items = [
		{ text: 'Design', description: 'Create beautiful interfaces with our component library' },
		{ text: 'Develop', description: 'Build robust applications with modern web technologies' },
		{ text: 'Deploy', description: 'Ship your applications to production with confidence' }
	]

	let value = $state(items[0])
	let config = $state({
		orientation: 'horizontal',
		position: 'before',
		align: 'start'
	})

	const schema = {
		type: 'object',
		properties: {
			orientation: {
				type: 'string',
				enum: ['horizontal', 'vertical'],
				default: 'horizontal'
			},
			position: {
				type: 'string',
				enum: ['before', 'after'],
				default: 'before'
			},
			align: {
				type: 'string',
				enum: ['start', 'center', 'end'],
				default: 'start'
			}
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/orientation',
				label: 'Orientation',
				description: 'Layout direction of the tabs'
			},
			{
				scope: '#/position',
				label: 'Position',
				description: 'Position of tab bar relative to content'
			},
			{
				scope: '#/align',
				label: 'Alignment',
				description: 'Alignment of tabs within the tab bar'
			}
		]
	}

	function handleConfigUpdate(newData) {
		config = { ...newData }
	}
</script>

<div class="flex w-full flex-col gap-1 md:flex-row">
	<div data-card class="flex-1 px-8">
		<h3>Live Preview</h3>
		<Tabs
			{items}
			bind:value
			orientation={config.orientation}
			position={config.position}
			align={config.align}
		>
			<div>
				<h4>Selected: {value.text}</h4>
				<p>{value.description}</p>
			</div>
		</Tabs>
	</div>
	<div class="bg-neutral-z2 w-full md:w-[40ch]">
		<h3 class="mb-0 mt-6 px-6">Configuration</h3>
		<FormRenderer data={config} {schema} {layout} onupdate={handleConfigUpdate} class="pt-0" />
	</div>
</div>
