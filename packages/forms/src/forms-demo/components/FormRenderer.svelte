<script>
	import FieldRenderer from './FieldRenderer.svelte'
	import { validate } from './validation.js'

	// Define props with defaults
	let {
		schema,
		layout,
		value = $bindable({}),
		onsubmit = $bindable(null),
		helpText = '',
		children
	} = $props()

	// Component state variables
	let errors = $state({})
	let submitted = $state(false)

	/**
	 * Validates form data against schema
	 */
	function validateForm() {
		if (!schema) return true

		const result = validate(schema, value)
		errors = result.errors || {}
		return result.valid
	}

	/**
	 * Handles form submission
	 */
	function handleSubmit(e) {
		e.preventDefault()
		submitted = true

		if (validateForm()) {
			onsubmit?.(value)
		}
	}

	/**
	 * Handles value changes for real-time validation
	 */
	function handleChange() {
		if (submitted) {
			validateForm()
		}
	}
</script>

{#snippet defaultControls()}
	<button type="submit" data-control="submit"> Submit </button>
{/snippet}

<form onsubmit={handleSubmit} data-form-root>
	{#if helpText}
		<div data-form-help>{helpText}</div>
	{/if}

	<div data-form-content>
		<FieldRenderer layout={layout || schema} {schema} bind:value {errors} onchange={handleChange} />
	</div>

	<!-- <div data-form-controls>
    {@render children?.() || defaultControls()}
  </div> -->
</form>
