<script>
	import { createEmitter } from '@rokkit/core'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} name
	 * @property {any} [state]
	 * @property {string} [size]
	 * @property {'img'|'button'|'checkbox'|'option'} [role]
	 * @property {any} [label]
	 * @property {boolean} [disabled]
	 * @property {number} [tabindex]
	 * @property {any} [checked]
	 * @event {MouseEvent} [onclick]
	 * @event {CustomEvent} [onchange]
	 * @event {MouseEvent} [onmouseenter]
	 * @event {MouseEvent} [onmouseleave]
	 */

	/** @type {Props} */
	let {
		ref = $bindable(),
		class: classes = '',
		name,
		state = null,
		size = 'base',
		role = 'img',
		label = null,
		disabled = false,
		tabindex = $bindable(0),
		checked = $bindable(null),
		...events
	} = $props()

	let emitter = $derived(createEmitter(events, ['click', 'change', 'mouseenter', 'mouseleave']))
	function handleClick(e) {
		if (role === 'img') return
		e.preventDefault()

		if (!disabled) {
			if (isCheckbox) {
				checked = !checked
				emitter?.change(checked)
			}
			emitter?.click()
		}
	}

	let isCheckbox = $derived(role === 'checkbox' || role === 'option')
	let validatedTabindex = $derived(role === 'img' || disabled ? -1 : tabindex)
	let ariaChecked = $derived(
		['checkbox', 'option'].includes(role) ? (checked !== null ? checked : false) : null
	)
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-icon
	bind:this={ref}
	data-tag-icon
	data-state={state}
	data-tag-button={role === 'button' ? true : undefined}
	data-tag-checkbox={isCheckbox ? true : undefined}
	data-size={size}
	data-disabled={disabled}
	class={classes}
	{role}
	aria-label={label ?? name}
	aria-checked={ariaChecked}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
	tabindex={validatedTabindex}
	onmouseenter={emitter.mouseenter}
	onnmouseleave={emitter.nmouseleave}
>
	<i class={name} aria-hidden="true"></i>
</rk-icon>
