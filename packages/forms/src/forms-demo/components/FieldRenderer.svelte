<script>
	import { getContext } from 'svelte'
	import LayoutRenderer from './LayoutRenderer.svelte'
	import InputField from './inputs/InputField.svelte'
	import { getFieldProperties } from './schemaUtils'

	// Define component props
	let {
		layout = {},
		schema = {},
		value = $bindable({}),
		errors = {},
		path = [],
		onchange = $bindable(null)
	} = $props()

	// Get registry from context if available
	const registry = getContext('form-registry')

	// Handle value change events
	function handleChange() {
		onchange?.()
	}

	// Determine if the layout has nested elements (a group)
	let isGroupLayout = $derived(
		layout && Array.isArray(layout.elements) && layout.elements.length > 0
	)

	// Get the field schema based on path
	let fieldSchema = $derived(() => {
		if (!schema || !path?.length) return schema

		let current = schema
		for (const pathItem of path) {
			if (!current) return null
			if (current.properties && current.properties[pathItem]) {
				current = current.properties[pathItem]
			} else if (current.items && pathItem.match(/^\d+$/)) {
				current = current.items
			} else {
				return null
			}
		}
		return current
	})

	// Get field metadata
	let fieldKey = $derived(path.join('.'))
	let fieldError = $derived(errors[fieldKey])

	// Combine properties from schema and layout
	let fieldProperties = $derived(getFieldProperties(schema, layout, path))
	let fieldType = $derived(layout.type || fieldProperties.type || fieldSchema?.type || 'string')

	// Create input props
	let inputProps = $derived(() => {
		const props = {
			...fieldProperties,
			...(layout.props || {}),
			fieldSchema,
			error: fieldError,
			onchange: handleChange,
			required: layout.required || fieldSchema?.required || false,
			// Extract specific field properties from schema
			min: fieldSchema?.min,
			max: fieldSchema?.max,
			minLength: fieldSchema?.minLength,
			maxLength: fieldSchema?.maxLength,
			pattern: fieldSchema?.pattern,
			format: fieldSchema?.format
		}

		// Handle enum values as options
		if (fieldSchema?.enum && !props.options) {
			props.options = fieldSchema.enum.map((val) => ({
				value: val,
				label: val
			}))
		}

		return props
	})
</script>

{#if isGroupLayout}
	<LayoutRenderer {layout} {schema} bind:value {errors} {onchange} />
{:else}
	<div data-field-wrapper data-field-type={fieldType}>
		{#if fieldSchema || !path?.length}
			<InputField bind:value {fieldType} {...inputProps} />
		{:else}
			<div data-field-error="schema">Invalid schema for path: {path.join('.')}</div>
		{/if}
	</div>
{/if}
