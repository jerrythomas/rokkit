<script>
	import { createEmitter } from '@rokkit/core'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} name
	 * @property {any} [state]
	 * @property {string} [size]
	 * @property {string} [role]
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
		e.preventDefault()

		if (!disabled) {
			if (role === 'checkbox' || role === 'option') {
				checked = !checked
				emitter?.change(checked)
			}
			emitter?.click()
		}
	}

	let validatedTabindex = $derived(role === 'img' || disabled ? -1 : tabindex)
	let ariaChecked = $derived(
		['checkbox', 'option'].includes(role) ? (checked !== null ? checked : false) : null
	)
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-icon
	class={classes}
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	class:disabled
	{role}
	aria-label={label ?? name}
	aria-checked={ariaChecked}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
	data-state={state}
	data-tag="icon"
	tabindex={validatedTabindex}
	onmouseenter={emitter.mouseenter}
	onnmouseleave={emitter.nmouseleave}
>
	<i class={name} aria-hidden="true"></i>
</rk-icon>
