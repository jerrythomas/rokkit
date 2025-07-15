<script>
	import { Tabs } from '@rokkit/ui'
	import { Button } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { goto } from '$app/navigation'

	let { data } = $props()
	let { schema, layout } = data

	// Configuration state - need this to be reactive for updates
	let config = $state({ ...data.config })
	let items = $state([...data.items])
	let selectedTab = $state(data.items[0])

	// Create form builder
	// let formBuilder = $derived(new FormBuilder(config, schema, layout))

	// Handle form configuration changes
	function handleConfigUpdate(newData) {
		config = { ...newData }
	}

	// Handle adding new tabs when editable
	function handleAddTab() {
		const newTabNumber = items.length + 1
		const newTab = {
			id: `tab${newTabNumber}`,
			label: `Tab ${newTabNumber}`,
			content: `Content for tab ${newTabNumber}`
		}
		items = [...items, newTab]
	}

	// Handle removing tabs when editable
	function handleRemoveTab(tab) {
		items = items.filter((item) => item.id !== tab.id)
		// Reset selection if removed tab was selected
		if (selectedTab?.id === tab.id) {
			selectedTab = items[0] || null
		}
	}
</script>

<!-- <div data-panel-root class="divide-neutral-inset flex w-full divide-x overflow-hidden"> -->
<!-- Main content with responsive layout -->
<div data-panel-body class=" flex w-full flex-col gap-6 p-8 lg:flex-row">
	<!-- Preview Panel -->
	<div data-panel-preview class="bg-neutral-inset flex flex-1 flex-col rounded-lg lg:basis-4/5">
		<h2 class="text-neutral-overlay mb-4 text-xl font-semibold">Live Preview</h2>

		<!-- Scrollable content area -->
		<!-- <div
			data-panel-content
			class="bg-neutral-base border-neutral-subtle flex flex-1 overflow-auto rounded-lg border p-6"
			style="max-height: 70vh;"
		> -->
		<Tabs
			{items}
			bind:value={selectedTab}
			orientation={config.orientation}
			position={config.position}
			align={config.align}
			editable={config.editable}
			placeholder={config.placeholder}
			fields={{ text: 'label', content: 'content' }}
			onadd={handleAddTab}
			onremove={handleRemoveTab}
			class="flex-1"
		>
			<div data-panel-info class="text-neutral-floating space-y-1 overflow-auto p-6 text-sm">
				<p>Content for the selected tab is displayed here</p>
				<p><strong>Selected Tab:</strong> {selectedTab?.label || 'None'}</p>
				<p><strong>Total Tabs:</strong> {items.length}</p>

				<div class="mt-8 space-y-4">
					<h3 class="font-semibold">Tab Content:</h3>
					<p>{selectedTab?.content || 'No content available'}</p>
				</div>
			</div>
		</Tabs>
		<!-- </div> -->
	</div>

	<!-- Configuration Panel -->
	<div data-panel-config class="flex w-full min-w-[40ch] flex-col gap-4 rounded-lg py-2 lg:w-1/5">
		<h2 class="text-neutral-overlay text-xl font-semibold">Configuration</h2>
		<FormRenderer onupdate={handleConfigUpdate} data={config} {schema} {layout} />
	</div>
</div>
<!-- </div> -->
