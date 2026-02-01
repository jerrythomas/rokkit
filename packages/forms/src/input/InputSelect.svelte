<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { Proxy } from '@rokkit/states'
	import { equals } from 'ramda'

	/**
	 * @typedef {Object} InputSelectProps
	 * @property {any} value - Selected value (bindable)
	 * @property {Object} [fields] - Field mapping for options
	 * @property {Array<Object>} [options] - Static options array
	 * @property {boolean} [loading] - Whether options are loading
	 * @property {string|null} [error] - Error message if loading failed
	 * @property {string} [placeholder] - Placeholder text
	 * @property {Function} [onchange] - Change callback
	 * @property {Function} [onfocus] - Focus callback
	 * @property {Function} [onblur] - Blur callback
	 */

	/** @type {InputSelectProps & { [key: string]: any }} */
	let {
		class: classes = '',
		value = $bindable(),
		fields = {},
		options = [],
		loading = false,
		error = null,
		icons = defaultStateIcons['selector'],
		placeholder = null,
		disabled = false,
		onchange,
		onfocus,
		onblur,
		...rest
	} = $props()

	let focused = $state(false)
	let icon = $derived(focused ? icons['opened'] : icons['closed'])
	let indexValue = $state(-1)
	let proxiedOptions = $derived(options.map((option) => new Proxy(option, fields)))

	// Sync indexValue when value or options change
	$effect(() => {
		indexValue = options.findIndex((item) => equals(item, value))
	})

	function handleChange(event) {
		if (indexValue >= 0 && indexValue < options.length) {
			value = options[indexValue]
			onchange?.(options[indexValue])
		}
	}

	function handleFocus(event) {
		focused = true
		onfocus?.(event)
	}

	function handleBlur(event) {
		focused = false
		onblur?.(event)
	}

	let isDisabled = $derived(disabled || loading)
	let placeholderText = $derived.by(() => {
		if (loading) return 'Loading...'
		if (error) return 'Error loading options'
		return placeholder
	})
</script>

<div
	data-input-select
	class={classes}
	data-loading={loading || undefined}
	data-error={error || undefined}
>
	<select
		bind:value={indexValue}
		disabled={isDisabled}
		{...rest}
		onchange={handleChange}
		onfocus={handleFocus}
		onblur={handleBlur}
	>
		{#if placeholderText}
			<option value={-1} disabled selected={indexValue === -1}>{placeholderText}</option>
		{/if}
		{#each proxiedOptions as option, index (index)}
			<option value={index} aria-current={equals(option.value, value)}>
				{option.get('text')}
			</option>
		{/each}
	</select>
	<span data-input-select-icon>
		{#if loading}
			<i class="loading-spinner"></i>
		{:else}
			<i class={icon}></i>
		{/if}
	</span>
</div>
