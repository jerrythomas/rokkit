<script>
	import { Tabs } from '@rokkit/ui'
	import { Button } from '@rokkit/ui'
	import { FormBuilder, FormRenderer } from '@rokkit/forms'
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

	function goBack() {
		goto('/playground')
	}
</script>

<div data-panel-root class="flex flex-1 flex-col overflow-auto">
	<!-- Header -->
	<div data-panel-header class="mb-8">
		<Button
			onclick={goBack}
			class="text-neutral-floating hover:text-neutral-overlay border-0 bg-transparent p-0 underline transition-colors"
		>
			← Back to Playground
		</Button>
		<h1 class="text-neutral-overlay mb-2 mt-4 text-2xl font-bold">Tabs Component Playground</h1>
		<p class="text-neutral-floating">
			Configure and test the Tabs component with different options
		</p>
	</div>

	<!-- Main content with responsive layout -->
	<div data-panel-body class="flex flex-1 flex-col gap-6 overflow-hidden p-8 lg:flex-row">
		<!-- Preview Panel -->
		<div
			data-panel-preview
			class="bg-neutral-inset border-neutral-subtle flex flex-1 flex-col rounded-lg border p-6 lg:basis-4/5"
		>
			<h2 class="text-neutral-overlay mb-4 text-xl font-semibold">Live Preview</h2>

			<!-- Scrollable content area -->
			<div
				data-panel-content
				class="bg-neutral-base border-neutral-subtle flex flex-1 overflow-auto rounded-lg border p-6"
				style="height: 600px;"
			>
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
					<div data-panel-info class="text-neutral-floating space-y-1 p-6 text-sm">
						<p>Content for the selected tab is displayed here</p>
						<p><strong>Selected Tab:</strong> {selectedTab?.label || 'None'}</p>
						<p><strong>Total Tabs:</strong> {items.length}</p>
					</div>
				</Tabs>
			</div>
		</div>

		<!-- Configuration Panel -->
		<div
			data-panel-config
			class="bg-neutral-inset border-neutral-subtle w-full min-w-[300px] overflow-auto rounded-lg border p-6 lg:w-1/5"
		>
			<h2 class="text-neutral-overlay mb-4 text-xl font-semibold">Configuration</h2>
			<FormRenderer onupdate={handleConfigUpdate} data={config} {schema} {layout} />
		</div>
	</div>
</div>
