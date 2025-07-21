<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { Proxy } from '@rokkit/states'
	import { equals } from 'ramda'

	/**
	 * @typedef {Object} InputSelectProps
	 * @property {any}           value
	 * @property {Object}        fields
	 * @property {Array<Object>} options
	 * @property {Function}      onchange
	 * @property {Function}      onfocus
	 * @property {Function}      onblur
	 */

	/** @type {InputSelectProps & { [key: string]: any }} */
	let {
		class: classes = '',
		value = $bindable(),
		fields,
		options = [],
		icons = defaultStateIcons['selector'],
		placeholder = null,
		onchange,
		onfocus,
		onblur,
		...rest
	} = $props()

	let focused = $state(false)
	let icon = $derived(focused ? icons['opened'] : icons['closed'])
	let indexValue = $state(options.findIndex((item) => equals(item, value)))
	let proxiedOptions = $derived(options.map((option) => new Proxy(option, fields)))

	function handleChange(event) {
		value = options[indexValue]
		onchange?.(options[indexValue])
	}

	function handleFocus(event) {
		focused = true
		onfocus?.(event)
	}

	function handleBlur(event) {
		focused = false
		onblur?.(event)
	}
</script>

<div data-input-select class={classes}>
	<select
		bind:value={indexValue}
		{...rest}
		onchange={handleChange}
		onfocus={handleFocus}
		onblur={handleBlur}
	>
		{#if placeholder}
			<option value="" disabled selected>{placeholder}</option>
		{/if}
		{#each proxiedOptions as option, index (index)}
			<option value={index} aria-current={equals(option.value, value)}>
				{option.get('text')}
			</option>
		{/each}
	</select>
	<span>
		<i class={icon}></i>
	</span>
</div>
