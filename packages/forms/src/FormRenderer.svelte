<script>
	/**
	 * FormRenderer component with snippet-based rendering
	 * Handles defaultInput, info, separator, display components, and custom child snippet selection.
	 * Supports form submission with validate-before-submit, loading state, and optional action buttons.
	 */

	import { onMount, untrack } from 'svelte'
	import InputField from './InputField.svelte'
	import InfoField from './InfoField.svelte'
	import { FormBuilder } from './lib/builder.svelte.js'
	import { defaultRenderers } from './lib/renderers.js'
	import DisplayTable from './display/DisplayTable.svelte'
	import DisplayCardGrid from './display/DisplayCardGrid.svelte'
	import DisplaySection from './display/DisplaySection.svelte'
	import DisplayList from './display/DisplayList.svelte'

	let {
		// Optional external builder instance
		builder = undefined,

		// Direct props (alternative to builder)
		data = $bindable(),
		schema = null,
		layout = null,

		// Lookup configurations
		lookups = {},

		// Validation mode: 'blur' | 'change' | 'manual'
		validateOn = 'blur',

		// Custom type renderers (merged with defaults)
		renderers = {},

		// Event handlers
		onupdate = undefined,
		onvalidate = undefined,
		onselect = undefined,
		onsubmit = undefined,

		// Custom actions snippet: receives { submitting, isValid, isDirty, submit, reset }
		actions = undefined,

		// Styling
		className = '',

		// Custom snippet
		child,

		// Pass through any other props
		...props
	} = $props()

	// Merged renderer registry
	const allRenderers = $derived({ ...defaultRenderers, ...renderers })

	// Stable FormBuilder instance — created once, updated via $effect
	let formBuilder = untrack(() => builder ?? new FormBuilder(data, schema, layout, lookups))

	// Initialize lookups after mount (async fire-and-forget; $state updates trigger re-derive)
	onMount(() => {
		if (Object.keys(lookups).length > 0) {
			formBuilder.initializeLookups()
		}
	})

	// Sync prop changes to builder
	$effect(() => {
		if (formBuilder.data !== data) {
			formBuilder.data = data
		}
	})

	$effect(() => {
		if (schema !== null && schema !== undefined) formBuilder.schema = schema
	})

	$effect(() => {
		if (layout !== null && layout !== undefined) formBuilder.layout = layout
	})

	// Apply external validation result for a field path
	function applyExternalValidation(fieldPath, value, event) {
		if (!onvalidate) return
		const result = onvalidate(fieldPath, value, event)
		if (result && typeof result === 'object' && result.state) {
			formBuilder.setFieldValidation(fieldPath, result)
		}
	}

	// Handle field value changes
	function handleFieldChange(element, newValue) {
		const fieldPath = element.scope.replace(/^#\//, '')
		formBuilder.updateField(fieldPath, newValue)
		data = formBuilder.data
		if (onupdate) onupdate(data)
		if (validateOn === 'change') formBuilder.validateField(fieldPath)
		applyExternalValidation(fieldPath, newValue, 'change')
	}

	// Handle blur events for validation
	function handleFieldBlur(element) {
		const fieldPath = element.scope.replace(/^#\//, '')
		const currentValue = formBuilder.getValue(fieldPath)
		if (validateOn === 'blur') formBuilder.validateField(fieldPath)
		applyExternalValidation(fieldPath, currentValue, 'blur')
	}

	// Submission state
	let submitting = $state(false)
	let formRoot = $state(null)

	// Focus the first invalid field in the form
	function focusFirstError() {
		const firstError = formBuilder.errors[0]
		if (!firstError || !formRoot) return
		const field = formRoot.querySelector(
			`[data-scope="#/${firstError.path}"] input, [data-scope="#/${firstError.path}"] select, [data-scope="#/${firstError.path}"] textarea`
		)
		field?.focus?.()
	}

	// Handle form submission: validate → focus first error → call onsubmit → snapshot
	async function handleSubmit(e) {
		e.preventDefault()
		if (submitting || !onsubmit) return

		formBuilder.validate()
		applyExternalValidation('*', data, 'submit')

		if (!formBuilder.isValid) {
			focusFirstError()
			return
		}

		submitting = true
		try {
			await onsubmit(formBuilder.getVisibleData(), { isValid: true, errors: [] })
			formBuilder.snapshot()
		} catch {
			// Consumer handles errors in their onsubmit callback
		} finally {
			submitting = false
		}
	}

	// Handle form reset
	function handleReset() {
		formBuilder.reset()
		data = formBuilder.data
	}
</script>

<!-- Form container: <form> when onsubmit provided, <div> otherwise -->
{#if onsubmit}
	<form
		bind:this={formRoot}
		data-form-root
		data-form-submitting={submitting || undefined}
		class={className}
		onsubmit={handleSubmit}
		{...props}
	>
		{#each formBuilder.elements as element, index (index)}
			{@render renderElement(element)}
		{/each}
		{#if actions}
			{@render actions({
				submitting,
				isValid: formBuilder.isValid,
				isDirty: formBuilder.isDirty,
				submit: handleSubmit,
				reset: handleReset
			})}
		{:else}
			<div data-form-actions>
				<button
					type="button"
					data-form-reset
					disabled={!formBuilder.isDirty || submitting}
					onclick={handleReset}>Reset</button
				>
				<button type="submit" data-form-submit disabled={!formBuilder.isDirty || submitting}
					>Submit</button
				>
			</div>
		{/if}
	</form>
{:else}
	<div bind:this={formRoot} data-form-root class={className} {...props}>
		{#each formBuilder.elements as element, index (index)}
			{@render renderElement(element)}
		{/each}
	</div>
{/if}

<!-- Render a single element by type -->
{#snippet renderElement(element)}
	{#if element.type === 'separator'}
		<div data-form-separator></div>
	{:else if element.type === 'group'}
		<fieldset data-form-group data-scope={element.scope}>
			{#if element.props?.label}
				<legend data-form-group-label>{element.props.label}</legend>
			{/if}
			{#each element.props?.elements ?? [] as child_element, i (child_element.scope ?? i)}
				{@render renderElement(child_element)}
			{/each}
		</fieldset>
	{:else if element.type === 'display-table'}
		<DisplayTable data={element.value} {...element.props} {onselect} />
	{:else if element.type === 'display-cards'}
		<DisplayCardGrid data={element.value} {...element.props} {onselect} />
	{:else if element.type === 'display-section'}
		<DisplaySection data={element.value} {...element.props} />
	{:else if element.type === 'display-list'}
		<DisplayList data={element.value} {...element.props} />
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
			<InputField
				name={element.scope}
				type={element.type}
				value={element.value}
				{...element.props}
				renderers={allRenderers}
				onchange={(newValue) => handleFieldChange(element, newValue)}
				onblur={() => handleFieldBlur(element)}
			/>
		</div>
	{/if}
{/snippet}
