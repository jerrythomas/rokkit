<script>
	import { defaultStateIcons } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [id]
	 * @property {any} name
	 * @property {boolean} [value]
	 * @property {boolean} [disabled]
	 * @property {boolean} [readOnly]
	 * @property {any} [stateIcons]
	 * @property {number} [tabindex]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		id = null,
		name,
		value = $bindable(false),
		disabled = false,
		readOnly = false,
		stateIcons = defaultStateIcons.checkbox,
		tabindex = 0
	} = $props()

	let isDisabled = $derived(disabled || readOnly)
	let state = $derived(value === null ? 'unknown' : value ? 'checked' : 'unchecked')

	function toggle(event) {
		event.preventDefault()
		event.stopPropagation()
		value = !value
	}
	function handleClick(event) {
		if (!isDisabled) toggle(event)
	}
	function handleKeydown(event) {
		if (isDisabled) return
		if (event.key === 'Enter' || event.key === ' ') toggle(event)
	}
</script>

<div
	data-checkbox-root
	{id}
	class={classes}
	role="checkbox"
	aria-checked={state}
	aria-disabled={isDisabled}
	data-disabled={isDisabled}
	data-state={state}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{tabindex}
>
	<input hidden type="checkbox" {name} disabled={isDisabled} bind:checked={value} />
	<span data-checkbox-indicator>
		<icon class={stateIcons[state]} aria-hidden="true"></icon>
	</span>
</div>
