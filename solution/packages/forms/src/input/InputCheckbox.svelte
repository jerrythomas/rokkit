<script>
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { isNil } from 'ramda'

	/**
	 * @typedef {ObjectIcon} StateIcons
	 * @property {string} checked
	 * @property {string} unchecked
	 * @property {string} unknown
	 */

	/**
	 * @typedef {Object} InputCheckboxProps
	 * @property {null|Boolean} value
	 * @property {'default'|'custom'} variant -
	 * @property {StateIcons} icons
	 * @property {Function} onchange
	 * @property {Function} onfocus
	 * @property {Function} onblur
	 * @property {boolean} required
	 * @property {boolean} disabled
	 * @property {string} name
	 * @property {string} id
	 */

	/** @type {InputCheckboxProps & { [key: string]: any }} */
	let {
		value = $bindable(),
		variant = 'custom',
		icons,
		onchange,
		onfocus,
		onblur,
		required,
		disabled,
		name,
		id,
		...rest
	} = $props()

	function handleChange(event) {
		value = Boolean(event.target.checked)
		onchange?.(value)
	}

	function toggle() {
		value = !Boolean(value)
		onchange?.(value)
	}

	let checked = $derived(Boolean(value))
	let stateIcons = $derived({ ...DEFAULT_STATE_ICONS.checkbox, ...icons })
	let icon = $derived(stateIcons[isNil(value) ? 'unknown' : value ? 'checked' : 'unchecked'])
</script>

<div data-checkbox-root data-variant={variant}>
	<input
		type="checkbox"
		hidden={variant !== 'default'}
		{required}
		{disabled}
		{name}
		{id}
		{checked}
		onchange={handleChange}
		{onfocus}
		{onblur}
		{...rest}
	/>
	{#if variant !== 'default'}
		<span class={icon} data-checkbox-icon role="button" tabindex="0" onclick={toggle} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()} aria-hidden="true"></span>
	{/if}
</div>
