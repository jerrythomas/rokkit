<script>
	import { TabGroup, Tab } from '@rokkit/bits-ui'
	import '../../../theme/tab.css'

	// Simple demo data
	let basicTabs = [
		{
			id: 'overview',
			label: 'Overview',
			content: 'This is the overview tab content with general information.'
		},
		{
			id: 'features',
			label: 'Features',
			content: 'Here are the key features and capabilities of this component.'
		},
		{
			id: 'examples',
			label: 'Examples',
			content: 'Various usage examples and implementation patterns.'
		}
	]

	let fileTabs = [
		{
			id: 'app',
			name: 'App.svelte',
			language: 'svelte',
			content: 'Main application component with counter logic and UI elements.'
		},
		{
			id: 'counter',
			name: 'Counter.svelte',
			language: 'svelte',
			content: 'Reusable counter component with increment functionality.'
		},
		{
			id: 'styles',
			name: 'styles.css',
			language: 'css',
			content: 'Stylesheet with component styling and theme variables.'
		}
	]

	let selectedBasic = $state('overview')
	let selectedFile = $state('app')
	let editableTabs = $state([...basicTabs])
	let selectedEditable = $state('overview')

	function handleSelect(event) {
		console.log('Tab selected:', event)
	}

	function handleAdd() {
		const newId = `tab-${Date.now()}`
		editableTabs = [
			...editableTabs,
			{
				id: newId,
				label: `New Tab ${editableTabs.length + 1}`,
				content: `Content for the new tab created at ${new Date().toLocaleTimeString()}.`
			}
		]
		selectedEditable = newId
	}

	function handleRemove(item) {
		editableTabs = editableTabs.filter((tab) => tab.id !== item.id)
		if (selectedEditable === item.id) {
			selectedEditable = editableTabs[0]?.id || null
		}
	}
</script>

<svelte:head>
	<title>Tab Component Lab | Learn Rokkit</title>
	<meta name="description" content="Testing the new Tab component built with bits-ui Command" />
</svelte:head>

<div class="bg-neutral-base container mx-auto space-y-8 overflow-auto px-4 py-8">
	<header>
		<h1 class="text-neutral-overlay mb-2 text-3xl font-bold">Tab Component Lab</h1>
		<p class="text-neutral-floating">
			Testing the new Tab component built with bits-ui Command and data-driven field mapping.
		</p>
	</header>

	<!-- Basic Tabs Example -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">Basic Tabs</h2>
		<p class="text-neutral-floating">Simple tabs with label and content fields.</p>

		<TabGroup
			options={basicTabs}
			bind:value={selectedBasic}
			fields={{ id: 'id', text: 'label', content: 'content' }}
			onselect={handleSelect}
		>
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4 text-sm">
				<strong>Selected:</strong>
				{selectedBasic.content}
			</div>
		</TabGroup>
	</section>

	<!-- File Tabs Example -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">File Tabs</h2>
		<p class="text-neutral-floating">Tabs representing files with custom field mappings.</p>

		<TabGroup
			options={fileTabs}
			fields={{ id: 'id', text: 'name', content: 'content' }}
			onselect={handleSelect}
			bind:value={selectedFile}
		>
			{#snippet child(item)}
				<span class="flex items-center gap-2">
					<span class="bg-neutral-subtle rounded px-1.5 py-0.5 text-xs">
						{item.value.language}
					</span>
					{item.get('text')}
				</span>
			{/snippet}
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4 text-sm">
				<strong>Selected:</strong>
				{selectedFile?.content}
			</div>
		</TabGroup>
	</section>

	<!-- Editable Tabs Example -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">Editable Tabs</h2>
		<p class="text-neutral-floating">Tabs with add/remove functionality.</p>

		<Tab
			items={editableTabs}
			fields={{ id: 'id', label: 'label', content: 'content' }}
			editable={true}
			onselect={handleSelect}
			onadd={handleAdd}
			onremove={handleRemove}
		/>

		<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4 text-sm">
			<strong>Selected:</strong>
			{selectedEditable}<br />
			<strong>Total tabs:</strong>
			{editableTabs.length}
		</div>
	</section>

	<!-- Empty State Example -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">Empty State</h2>
		<p class="text-neutral-floating">Tab component with no items.</p>

		<Tab items={[]} fields={{ id: 'id', label: 'label', content: 'content' }}>
			{#snippet empty()}
				<div class="text-neutral-floating p-8 text-center">
					<div class="mb-2 text-4xl">📋</div>
					<h3 class="mb-1 text-lg font-semibold">No tabs available</h3>
					<p class="text-sm">Add some tabs to get started</p>
				</div>
			{/snippet}
		</Tab>
	</section>

	<!-- API Reference -->
	<section class="space-y-4">
		<h2 class="text-neutral-overlay text-2xl font-semibold">API Reference</h2>
		<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
			<ul class="text-neutral-floating space-y-1 text-sm">
				<li>• <code>items</code> - Array of tab data</li>
				<li>• <code>fields</code> - Field mappings for data extraction</li>
				<li>• <code>value</code> - Selected tab (bindable)</li>
				<li>• <code>editable</code> - Enable add/remove functionality</li>
				<li>• <code>child</code> - Custom tab header snippet</li>
				<li>• <code>children</code> - Custom tab content snippet</li>
				<li>• <code>empty</code> - Custom empty state snippet</li>
				<li>• <code>onselect/onadd/onremove</code> - Event callbacks</li>
			</ul>
		</div>
	</section>
</div>
