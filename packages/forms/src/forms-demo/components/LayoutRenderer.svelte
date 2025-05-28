<script>
	import FieldRenderer from './FieldRenderer.svelte'

	let {
		layout = {},
		schema = {},
		value = $bindable({}),
		errors = {},
		onchange = $bindable(null)
	} = $props()

	// Process layout elements
	let layoutType = $derived(layout?.type || 'vertical')
	let layoutElements = $derived(layout?.elements || [])
	let layoutTitle = $derived(layout?.title || layout?.label || '')

	// Filter errors by prefix for nested objects
	function filterErrorsByPrefix(errors, prefix) {
		if (!errors || !prefix) return {}

		const result = {}
		for (const [key, value] of Object.entries(errors)) {
			if (key.startsWith(`${prefix}.`)) {
				result[key.substring(prefix.length + 1)] = value
			}
		}
		return result
	}

	// Get data attribute for span based on the element configuration
	function getSpanAttribute(element) {
		if (!element.span) return null
		const span = parseInt(element.span)
		if (isNaN(span) || span <= 0 || span > 12) return null
		return span
	}

	// Handle field change events
	function handleChange() {
		onchange?.()
	}

	// Render element based on its configuration
	function renderElement(element, elementPath) {
		const elementKey = element.key || ''
		const isNested = element.elements && element.elements.length > 0

		// Determine if this element refers to a property in the object
		const isObjectProperty = elementKey && typeof value === 'object' && value !== null

		if (isNested && isObjectProperty) {
			return {
				layout: { ...element, path: elementPath },
				schema,
				value: value[elementKey],
				errors: filterErrorsByPrefix(errors, elementKey),
				path: elementPath,
				onchange: handleChange
			}
		} else if (isNested) {
			return {
				layout: { ...element, path: elementPath },
				schema,
				value,
				errors,
				path: elementPath,
				onchange: handleChange
			}
		} else if (isObjectProperty) {
			return {
				layout: element,
				schema,
				value: value[elementKey],
				errors: filterErrorsByPrefix(errors, elementKey),
				path: elementPath,
				onchange: handleChange
			}
		} else {
			return {
				layout: element,
				schema,
				value,
				errors,
				path: elementPath,
				onchange: handleChange
			}
		}
	}
</script>

<div data-layout data-layout-type={layoutType} data-has-title={!!layoutTitle ? 'true' : 'false'}>
	{#if layoutTitle}
		<div data-layout-title>{layoutTitle}</div>
	{/if}

	<div data-layout-content>
		{#each layoutElements as element (element.key)}
			{@const elementKey = element.key || ''}
			{@const elementPath = elementKey ? [...(layout.path || []), elementKey] : layout.path || []}
			{@const span = getSpanAttribute(element)}
			{@const elementProps = renderElement(element, elementPath)}

			<div data-layout-item data-element-key={elementKey} data-span={span}>
				<FieldRenderer {...elementProps} />
			</div>
		{/each}
	</div>
</div>
