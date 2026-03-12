<script>
	// @ts-nocheck
	import { untrack } from 'svelte'
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { equals } from 'ramda'

	let { data } = $props()
	let schema = $derived(data.schema)
	let layout = $derived(data.layout)

	// Configuration state - need this to be reactive for updates
	// untrack: intentionally snapshot initial server data for local mutation
	let config = $state({ ...untrack(() => data.config) })
	let items = $state([...untrack(() => data.items)])
	let selectedTab = $state(untrack(() => data.items[0]))

	// Handle form configuration changes
	function handleConfigUpdate(newData) {
		config = { ...newData }
	}

	// Handle adding new tabs when editable
	function handleAddTab() {
		console.log('add')
		const newTabNumber = Math.max(...items.map((item) => item.number)) + 1
		const newTab = {
			number: newTabNumber,
			label: `Tab ${newTabNumber}`,
			content: `Content for tab ${newTabNumber}`
		}
		items.push(newTab)
	}

	// Handle removing tabs when editable
	function handleRemoveTab(tab) {
		console.log('removed', tab)
		items = items.filter((item) => !equals(item, tab))
		// Reset selection if removed tab was selected
		if (equals(selectedTab, tab)) {
			selectedTab = items[0] || null
		}
	}
</script>

<!-- Main content with responsive layout -->
<div data-panel-body class="bg-surface-z1 flex w-full flex-col gap-6 p-8 lg:flex-row">
	<!-- Preview Panel -->
	<div data-panel-preview class="bg-surface-z1 flex flex-1 flex-col rounded-lg lg:basis-4/5">
		<h2 class="text-surface-z8 mb-4 text-xl font-semibold">Live Preview</h2>

		<Tabs
			options={items}
			bind:value={selectedTab}
			orientation={config.orientation}
			position={config.position}
			align={config.align}
			editable={config.editable}
			placeholder={config.placeholder}
			fields={{ label: 'label', content: 'content' }}
			onadd={handleAddTab}
			onremove={handleRemoveTab}
			class="flex-1"
		>
			{#snippet tabPanel(item)}
				<div data-panel-info class="text-surface-z7 space-y-1 overflow-auto p-6 text-sm">
					<p>Content for the selected tab is displayed here</p>
					<p><strong>Selected Tab:</strong> {item?.label || 'None'}</p>
					<p><strong>Total Tabs:</strong> {items.length}</p>

					<div class="mt-8 space-y-4">
						<h3 class="font-semibold">Tab Content:</h3>
						<p>{item?.content || 'No content available'}</p>
					</div>
				</div>
			{/snippet}
		</Tabs>
		<!-- </div> -->
	</div>

	<!-- Configuration Panel -->
	<div data-panel-config class="flex w-full min-w-[40ch] flex-col gap-4 rounded-lg py-2 lg:w-1/5">
		<h2 class="text-surface-z8 text-xl font-semibold">Configuration</h2>
		<FormRenderer onupdate={handleConfigUpdate} data={config} {schema} {layout} />
	</div>
</div>
<!-- </div> -->
