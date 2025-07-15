<script>
	/**
	 * FormRenderer component with snippet-based rendering
	 * Handles defaultInput and custom child snippet selection based on override flag
	 */

	import InputField from './InputField.svelte'
	import { FormBuilder } from './lib/builder.svelte.js'

	let {
		// FormBuilder binding

		// Direct props (alternative to builder)
		data = $bindable(),
		schema = null,
		layout = null,

		// Event handlers
		onupdate = undefined,
		onvalidate = undefined,

		// Styling
		className = '',

		// Custom snippet
		child,

		// Pass through any other props
		...props
	} = $props()

	// Use provided builder or create one from data/schema/layout
	let formBuilder = $derived(new FormBuilder(data, schema, layout))
	// Get elements from the builder
	let elements = $derived(() => formBuilder.elements)

	// Handle field value changes
	function handleFieldChange(element, newValue) {
		const fieldPath = element.scope.replace(/^#\//, '')

		if (formBuilder) {
			// Update through FormBuilder
			formBuilder.updateField(fieldPath, newValue)
		} else {
			// Update data directly
			updateNestedValue(data, fieldPath, newValue)
		}

		// Call onupdate callback if provided
		if (onupdate) {
			const currentData = formBuilder ? formBuilder.data : data
			onupdate(currentData)
		}

		// Trigger validation if handler provided
		if (onvalidate) {
			onvalidate(fieldPath, newValue)
		}
	}

	// Helper function to update nested object values
	function updateNestedValue(obj, path, value) {
		const keys = path.split('/')
		let current = obj

		for (let i = 0; i < keys.length - 1; i++) {
			if (!(keys[i] in current)) {
				current[keys[i]] = {}
			}
			current = current[keys[i]]
		}

		current[keys[keys.length - 1]] = value
	}

	// Handle focus events for validation
	function handleFieldFocus(element) {
		// Could trigger validation on focus if needed
	}

	// Handle blur events for validation
	function handleFieldBlur(element) {
		if (onvalidate) {
			const fieldPath = element.scope.replace(/^#\//, '')
			const currentValue = element.value
			onvalidate(fieldPath, currentValue, 'blur')
		}
	}
</script>

<!-- Form container -->
<div data-form-root class={className} {...props}>
	<!-- <div data-form-field data-scope={formBuilder.elements[0].scope}>
		{@render defaultInput(formBuilder.elements[0])}
	</div> -->
	{#each formBuilder.elements as element, index (index)}
		<div data-form-field data-scope={element.scope}>
			{#if element.override && child}
				{@render child(element)}
			{:else}
				{@render defaultInput(element)}
			{/if}
		</div>
	{/each}
</div>

<!-- Default input snippet -->
{#snippet defaultInput(element)}
	<InputField
		name={element.scope}
		type={element.type}
		value={element.value}
		{...element.props}
		onchange={(newValue) => handleFieldChange(element, newValue)}
		onfocus={() => handleFieldFocus(element)}
		onblur={() => handleFieldBlur(element)}
	/>
{/snippet}
