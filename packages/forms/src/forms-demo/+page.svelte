<script>
	import { FormRenderer } from '@rokkit/forms'
	import { setContext } from 'svelte'
	import {
		deriveSchemaFromValue,
		deriveLayoutFromValue,
		getSchemaWithLayout
	} from './components/schemaUtils.js'

	let { data } = $props()
	let { schema, layout, value } = data

	// Create form registry (could be moved to a more central location)
	const formRegistry = {
		inputs: {},
		layouts: {},
		validators: {}
	}

	// Set registry in context for child components to access
	setContext('form-registry', formRegistry)

	// State variables
	let currentSchema = $state(schema)
	let currentLayout = $state(layout)
	let formData = $state(value)
	let activeTab = $state('separated')
	let showDerived = $state(false)

	// Dynamic derived values
	let derivedSchema = $derived(showDerived ? deriveSchemaFromValue(formData) : currentSchema)
	let derivedLayout = $derived(showDerived ? deriveLayoutFromValue(formData) : currentLayout)
	let combinedSchema = $derived(getSchemaWithLayout(derivedSchema, derivedLayout))

	// Form submission handler
	function handleSubmit(data) {
		alert('Form submitted! Check console for data.')
		console.log('Submitted data:', data)
	}

	// Toggle between separated and combined schema/layout
	function handleTabChange(tab) {
		activeTab = tab
	}
</script>

<div class="forms-demo">
	<header>
		<h1>Dynamic Form Renderer</h1>
		<p>This demo shows how to render complex forms using schema and layout definitions.</p>
	</header>

	<div class="demo-tabs">
		<button
			onclick={() => handleTabChange('separated')}
			data-active={activeTab === 'separated' ? 'true' : 'false'}
		>
			Separated Schema & Layout
		</button>
		<button
			onclick={() => handleTabChange('combined')}
			data-active={activeTab === 'combined' ? 'true' : 'false'}
		>
			Combined Schema
		</button>
		<label class="derive-toggle">
			<input type="checkbox" bind:checked={showDerived} />
			Use Derived Schema/Layout
		</label>
	</div>

	<div class="demo-container">
		{#if activeTab === 'separated'}
			<FormRenderer
				schema={derivedSchema}
				layout={derivedLayout}
				bind:value={formData}
				onsubmit={handleSubmit}
				helpText={showDerived
					? 'This form uses schema and layout derived from the data.'
					: 'This form uses separate schema and layout definitions.'}
			/>
		{:else}
			<FormRenderer
				schema={combinedSchema}
				bind:value={formData}
				onsubmit={handleSubmit}
				helpText="This form uses a combined schema that incorporates layout information."
			/>
		{/if}
	</div>

	<div class="debug-info">
		<h3>Current Form Data:</h3>
		<pre>{JSON.stringify(formData, null, 2)}</pre>
	</div>
</div>
