<script>
	/**
	 * FormRenderer component with snippet-based rendering
	 * Handles defaultInput and custom child snippet selection based on override flag
	 */

	import Input from './Input.svelte'

	let {
		// FormBuilder binding
		builder,

		// Direct props (alternative to builder)
		data = $bindable(),
		schema = {},
		layout = {},

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

	// Use builder if provided, otherwise create derived elements
	let elements = $derived(() => {
		if (builder) {
			return builder.elements
		}
		// TODO: Create elements from data/schema/layout if no builder provided
		return []
	})

	// Handle field value changes
	function handleFieldChange(element, newValue) {
		const fieldPath = element.scope.replace(/^#\//, '')

		if (builder) {
			// Update through FormBuilder
			builder.updateField(fieldPath, newValue)
		} else {
			// Update data directly
			updateNestedValue(data, fieldPath, newValue)
		}

		// Call onupdate callback if provided
		if (onupdate) {
			const currentData = builder ? builder.data : data
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
<div class="form-renderer {className}" {...props}>
	{#each elements as element (element.scope)}
		{#if element.override && child}
			<!-- Use custom child snippet for overridden elements -->
			{@render child(element)}
		{:else}
			<!-- Use default input snippet -->
			{@render defaultInput(element)}
		{/if}
	{/each}
</div>

<!-- Default input snippet -->
{#snippet defaultInput(element)}
	<div class="form-field" data-scope={element.scope}>
		<Input
			type={element.type}
			bind:value={element.value}
			onchange={(newValue) => handleFieldChange(element, newValue)}
			onfocus={() => handleFieldFocus(element)}
			onblur={() => handleFieldBlur(element)}
			{...element.props}
		/>
	</div>
{/snippet}

<style>
	.form-renderer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
	}

	.form-field[data-scope] {
		/* Scope-specific styling can be added here */
	}

	/* Responsive layout */
	@media (min-width: 768px) {
		.form-renderer {
			gap: 1.5rem;
		}
	}
</style>
