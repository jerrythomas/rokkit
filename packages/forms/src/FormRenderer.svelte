<script>
	/**
	 * FormRenderer component with snippet-based rendering
	 * Handles defaultInput, info, separator, and custom child snippet selection
	 */

	import InputField from './InputField.svelte'
	import InfoField from './InfoField.svelte'
	import { FormBuilder } from './lib/builder.svelte.js'

	let {
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

	// Handle field value changes
	function handleFieldChange(element, newValue) {
		const fieldPath = element.scope.replace(/^#\//, '')

		// Update data directly for bindable reactivity
		const keys = fieldPath.split('/')
		if (keys.length === 1) {
			data = { ...data, [keys[0]]: newValue }
		} else {
			updateNestedValue(data, fieldPath, newValue)
			data = { ...data }
		}

		// Call onupdate callback if provided
		if (onupdate) {
			onupdate(data)
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
	{#each formBuilder.elements as element, index (index)}
		{#if element.type === 'separator'}
			<div data-form-separator></div>
		{:else if element.type === 'info'}
			<div data-form-field data-scope={element.scope}>
				<InfoField
					name={element.scope}
					value={element.value}
					label={element.props?.label}
					description={element.props?.description}
				/>
			</div>
		{:else if element.override && child}
			<div data-form-field data-scope={element.scope}>
				{@render child(element)}
			</div>
		{:else}
			<div data-form-field data-scope={element.scope}>
				{@render defaultInput(element)}
			</div>
		{/if}
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
		onblur={() => handleFieldBlur(element)}
	/>
{/snippet}
